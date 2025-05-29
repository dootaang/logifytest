/**
 * 고급 클립보드 복사 유틸리티
 * HTML과 이미지를 함께 클립보드에 복사하여 에디터에 붙여넣기할 때 스타일과 이미지가 함께 적용되도록 합니다.
 */

interface AdvancedClipboardOptions {
  htmlContent: string;
  plainTextContent?: string;
  imageUrls?: string[];
  title?: string;
  author?: string;
}

/**
 * 이미지 URL을 base64 데이터 URL로 변환
 * RisuAI의 방식을 참고하여 로컬 이미지도 완전히 base64로 변환
 */
async function convertImageToDataUrl(imageUrl: string): Promise<string> {
  try {
    // 데이터 URL이면 그대로 반환
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    // 이미지 URL 정규화
    let fetchUrl = imageUrl;
    if (imageUrl.startsWith('/uploads/')) {
      // 레거시 로컬 업로드 이미지는 현재 호스트 기준으로 절대 URL 생성
      if (typeof window !== 'undefined') {
        fetchUrl = window.location.protocol + '//' + window.location.host + imageUrl;
      } else {
        // Vercel 환경에서는 이 경로가 사용되지 않지만 폴백 제공
        fetchUrl = imageUrl;
      }
    } else if (imageUrl.startsWith('//')) {
      // 프로토콜이 없는 URL은 https 추가
      fetchUrl = 'https:' + imageUrl;
    } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      // 프로토콜이 없으면 https 추가
      fetchUrl = 'https://' + imageUrl;
    }

    console.log(`🖼️ 이미지 변환 시작: ${imageUrl} -> ${fetchUrl}`);

    // 이미지를 다양한 방법으로 시도
    let response;
    let dataUrl;
    
    // 방법 1: 직접 fetch 시도
    try {
      response = await fetch(fetchUrl);
      if (response.ok) {
        const blob = await response.blob();
        dataUrl = await blobToDataUrl(blob);
        console.log(`✅ 직접 fetch 성공: ${dataUrl.length} 문자 길이`);
        return dataUrl;
      }
    } catch (fetchError) {
      console.warn(`직접 fetch 실패: ${fetchError}`);
    }
    
    // 방법 2: 이미지 엘리먼트를 사용한 canvas 변환 (CORS 무시)
    try {
      dataUrl = await imageToDataUrlViaCanvas(fetchUrl);
      if (dataUrl && dataUrl !== fetchUrl) {
        console.log(`✅ Canvas 변환 성공: ${dataUrl.length} 문자 길이`);
        return dataUrl;
      }
    } catch (canvasError) {
      console.warn(`Canvas 변환 실패: ${canvasError}`);
    }
    
    // 방법 3: 여러 프록시 서비스 시도
    const proxyServices = [
      `https://cors-anywhere.herokuapp.com/${fetchUrl}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`,
      `https://thingproxy.freeboard.io/fetch/${fetchUrl}`
    ];
    
    for (const proxyUrl of proxyServices) {
      try {
        console.log(`🔄 프록시 시도: ${proxyUrl}`);
        response = await fetch(proxyUrl);
        if (response.ok) {
          const blob = await response.blob();
          dataUrl = await blobToDataUrl(blob);
          console.log(`✅ 프록시 성공: ${dataUrl.length} 문자 길이`);
          return dataUrl;
        }
      } catch (proxyError) {
        console.warn(`프록시 실패 ${proxyUrl}: ${proxyError}`);
      }
    }
    
    // 모든 방법이 실패하면 원본 URL 반환
    console.log(`⚠️ 모든 변환 방법 실패, 원본 URL 반환: ${imageUrl}`);
    return imageUrl;
    
  } catch (error) {
    console.error(`❌ 이미지 변환 실패 ${imageUrl}:`, error);
    return imageUrl; // 실패하면 원본 URL 반환
  }
}

/**
 * Blob을 데이터 URL로 변환
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 이미지 엘리먼트와 Canvas를 사용하여 데이터 URL로 변환 (CORS 무시)
 */
async function imageToDataUrlViaCanvas(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS 설정
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 원본 크기 유지하되, 너무 큰 이미지는 리사이즈
        let { width, height } = img;
        const maxSize = 2000; // 최대 크기 제한
        
        if (width > maxSize || height > maxSize) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxSize;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxSize;
            width = Math.round(height * aspectRatio);
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0, width, height);
        
        // JPEG로 변환 (압축률 0.9로 고품질 유지)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('이미지 로드 실패'));
    };
    
    // 이미지 로드 시작
    img.src = imageUrl;
  });
}

/**
 * HTML을 정리하는 함수 (불필요한 &nbsp; 제거 등)
 */
function cleanHtml(html: string): string {
  return html
    // 모든 &nbsp; 제거 (필요한 경우 일반 공백으로 대체)
    .replace(/&nbsp;/g, ' ')
    // 태그 사이의 불필요한 공백 제거
    .replace(/>\s+</g, '><')
    // 연속된 공백을 하나로 정리
    .replace(/\s{2,}/g, ' ')
    // 줄 시작과 끝의 공백 제거
    .replace(/^\s+/gm, '')
    .replace(/\s+$/gm, '')
    // HTML 엔티티 정리
    .replace(/&quot;/g, '"')
    // 빈 줄 정리 (연속된 빈 줄을 하나로)
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * DOM을 사용하여 HTML을 정리하고 재구성
 */
function reconstructHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // 모든 텍스트 노드에서 불필요한 공백 제거
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  const textNodes: Text[] = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }
  
  textNodes.forEach(textNode => {
    // 텍스트 노드의 내용에서 불필요한 공백 제거
    const cleanedText = textNode.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (cleanedText) {
      textNode.textContent = cleanedText;
    } else if (textNode.textContent?.includes('\n') || textNode.textContent?.includes('\t')) {
      // 줄바꿈이나 탭이 포함된 경우 유지
      textNode.textContent = textNode.textContent.replace(/[ \t]+/g, ' ');
    }
  });
  
  return doc.body.innerHTML;
}

/**
 * HTML 내의 모든 이미지 URL을 base64 데이터 URL로 변환
 */
async function convertHtmlImagesToDataUrls(html: string): Promise<string> {
  // 먼저 HTML 정리
  const cleanedHtml = cleanHtml(html);
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanedHtml, 'text/html');
  const images = doc.querySelectorAll('img');

  for (const img of images) {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      try {
        const dataUrl = await convertImageToDataUrl(src);
        img.setAttribute('src', dataUrl);
        img.setAttribute('alt', 'from 제리형 생성기');
      } catch (error) {
        console.warn(`Failed to convert image ${src}:`, error);
      }
    }
  }

  // DOM을 사용하여 HTML 재구성 후 최종 정리
  const reconstructedHtml = reconstructHtml(doc.body.innerHTML);
  return cleanHtml(reconstructedHtml);
}

/**
 * 고급 클립보드 복사 함수
 * HTML과 이미지를 함께 클립보드에 복사합니다.
 */
export async function copyToAdvancedClipboard(options: AdvancedClipboardOptions): Promise<boolean> {
  try {
    const { htmlContent, plainTextContent, title = '제리형 생성기', author = '제리형 생성기' } = options;

    // 브라우저가 고급 클립보드 API를 지원하는지 확인
    if (!navigator.clipboard || !navigator.clipboard.write) {
      // 지원하지 않으면 기본 텍스트 복사로 폴백
      await navigator.clipboard.writeText(plainTextContent || htmlContent);
      return false;
    }

    // HTML 내의 이미지를 base64로 변환
    const processedHtml = await convertHtmlImagesToDataUrls(htmlContent);

    // 원본 HTML을 그대로 사용 (래퍼 없이)
    const styledHtml = processedHtml;

    // 클립보드에 HTML과 텍스트 모두 복사
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([plainTextContent || htmlContent], { type: 'text/plain' }),
        'text/html': new Blob([styledHtml], { type: 'text/html' })
      })
    ]);

    return true;
  } catch (error) {
    console.error('Advanced clipboard copy failed:', error);
    
    // 실패하면 기본 텍스트 복사로 폴백
    try {
      await navigator.clipboard.writeText(options.plainTextContent || options.htmlContent);
      return false;
    } catch (fallbackError) {
      console.error('Fallback clipboard copy also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * 간단한 클립보드 복사 함수 (폴백용)
 */
export async function copyToSimpleClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // 구형 브라우저 지원
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
} 
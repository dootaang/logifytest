import { NextRequest, NextResponse } from 'next/server'

interface UploadResponse {
  status: boolean;
  url?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 })
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 })
    }

    // 프록시 서버를 통한 아카라이브 업로드 시도 (사용자 제공 코드 방식)
    const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL
    console.log('프록시 URL:', proxyUrl) // 디버깅용
    
    if (proxyUrl) {
      try {
        console.log('프록시 서버 업로드 시도 중...', file.name)
        
        const uploadFormData = new FormData()
        uploadFormData.append("upload", file) // 사용자 제공 코드와 동일한 필드명
        
        const response = await fetch(`${proxyUrl}/upload`, {
          method: "POST",
          body: uploadFormData,
        })

        console.log('프록시 서버 응답 상태:', response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log('프록시 서버 응답 데이터:', data)
          
          if (data.url) {
            return NextResponse.json({ 
              success: true, 
              url: data.url,
              fullUrl: data.url.startsWith('//') ? `https:${data.url}` : data.url,
              method: 'proxy'
            })
          }
        } else {
          const errorText = await response.text()
          console.error('프록시 서버 응답 오류:', response.status, errorText)
          
          // 404 오류일 경우 특별한 처리
          if (response.status === 500 && errorText.includes('404')) {
            return NextResponse.json({ 
              success: false,
              error: '아카라이브 업로드 API에 일시적 문제가 발생했습니다.',
              message: '아카라이브에서 직접 이미지를 업로드해주세요.',
              details: {
                proxyError: errorText,
                reason: '아카라이브 API 엔드포인트 변경 또는 서버 문제',
                solutions: [
                  '1. 몇 분 후 다시 시도해보세요',
                  '2. 아카라이브에서 직접 업로드 후 URL 복사',
                  '3. 기본 이미지(유즈, 레몬 등) 사용'
                ]
              },
              instructions: [
                '1. 아카라이브 게시글 작성 화면으로 이동',
                '2. 이미지를 업로드하여 에디터에 삽입',
                '3. 생성된 이미지 HTML 코드를 복사',
                '4. 여기서 "아카라이브 이미지 URL" 필드에 붙여넣기',
                '5. URL이 자동으로 추출됩니다'
              ]
            }, { status: 400 })
          }
        }
      } catch (proxyError) {
        console.error('프록시 서버 업로드 실패:', proxyError)
      }
    } else {
      console.log('프록시 URL이 설정되지 않음')
    }

    // 프록시 서버가 없거나 실패한 경우, 직접 아카라이브 API 시도
    const uploadMethods = [
      // 방식 1: 표준 아카라이브 업로드 API
      async () => {
        const arcaFormData = new FormData()
        arcaFormData.append('upload', file)
        
        const response = await fetch('https://arca.live/api/file?contentType=image', {
          method: 'POST',
          body: arcaFormData,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://arca.live/',
            'Origin': 'https://arca.live'
          }
        })
        return response
      },
      
      // 방식 2: 다른 필드명 시도
      async () => {
        const arcaFormData = new FormData()
        arcaFormData.append('userfile[]', file)
        
        const response = await fetch('https://arca.live/api/file?contentType=image', {
          method: 'POST',
          body: arcaFormData,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://arca.live/',
            'Origin': 'https://arca.live'
          }
        })
        return response
      },
      
      // 방식 3: 다른 엔드포인트 시도
      async () => {
        const arcaFormData = new FormData()
        arcaFormData.append('upload', file)
        
        const response = await fetch('https://arca.live/api/upload', {
          method: 'POST',
          body: arcaFormData,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://arca.live/',
            'Origin': 'https://arca.live'
          }
        })
        return response
      }
    ]

    for (const uploadMethod of uploadMethods) {
      try {
        const arcaResponse = await uploadMethod()
        
        if (arcaResponse.ok) {
          const arcaResult = await arcaResponse.json()
          console.log('아카라이브 응답:', arcaResult)

          // 다양한 응답 형식 처리
          let imageUrl = null
          
          // 응답 형식 1: result 배열
          if (arcaResult && arcaResult.result && arcaResult.result.length > 0) {
            imageUrl = arcaResult.result[0].url || arcaResult.result[0].link
          }
          // 응답 형식 2: data 객체
          else if (arcaResult && arcaResult.data && arcaResult.data.url) {
            imageUrl = arcaResult.data.url
          }
          // 응답 형식 3: 직접 url 필드
          else if (arcaResult && arcaResult.url) {
            imageUrl = arcaResult.url
          }

          if (imageUrl) {
            // URL이 //로 시작하지 않으면 추가
            if (!imageUrl.startsWith('//') && !imageUrl.startsWith('http')) {
              imageUrl = '//' + imageUrl
            }
            
            return NextResponse.json({ 
              success: true, 
              url: imageUrl,
              fullUrl: `https:${imageUrl}`,
              method: 'direct'
            })
          }
        }
      } catch (methodError) {
        console.log('업로드 방식 실패:', methodError)
        continue
      }
    }

    // 모든 업로드 방식 실패 시
    return NextResponse.json({ 
      success: false,
      error: '아카라이브 이미지 업로드에 실패했습니다.',
      message: '아카라이브에서 직접 이미지를 업로드해주세요.',
      proxyUrl: proxyUrl || '프록시 URL이 설정되지 않음',
      instructions: [
        '1. 아카라이브 게시글 작성 화면으로 이동',
        '2. 이미지를 업로드하여 에디터에 삽입',
        '3. 생성된 이미지 HTML 코드를 복사',
        '4. 여기서 "아카라이브 이미지 URL" 필드에 붙여넣기',
        '5. URL이 자동으로 추출됩니다'
      ]
    }, { status: 400 })

  } catch (error) {
    console.error('업로드 오류:', error)
    return NextResponse.json({ 
      success: false,
      error: '업로드 중 오류가 발생했습니다.',
      message: '아카라이브에서 직접 이미지를 업로드해주세요.'
    }, { status: 500 })
  }
} 
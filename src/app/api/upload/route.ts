import { NextRequest, NextResponse } from 'next/server'

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  originalName?: string;
  size?: number;
  type?: string;
  isDataUrl?: boolean;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    console.log('Upload API called');
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 })
    }

    console.log('File received:', file.name, file.size, file.type);

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json({ 
        success: false, 
        error: 'File size too large. Maximum 5MB allowed.' 
      }, { status: 400 })
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ 
        success: false, 
        error: 'Only image files are allowed.' 
      }, { status: 400 })
    }

    // Vercel 환경에서는 파일 시스템에 저장할 수 없으므로
    // base64 데이터 URL로 변환하여 반환
    const bytes = await file.arrayBuffer()
    
    // Node.js Buffer를 사용하여 안전하게 base64 변환
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log('File processed successfully, base64 length:', base64.length);

    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      fileName: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      isDataUrl: true
    }, { status: 200 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}

// OPTIONS 메서드 추가 (CORS 프리플라이트 요청 처리)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 
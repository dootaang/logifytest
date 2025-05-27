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
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File size too large. Maximum 5MB allowed.' 
      }, { status: 400 })
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only image files are allowed.' 
      }, { status: 400 })
    }

    // Vercel 환경에서는 파일 시스템에 저장할 수 없으므로
    // base64 데이터 URL로 변환하여 반환
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      fileName: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      isDataUrl: true
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed. Please try again.' 
    }, { status: 500 })
  }
} 
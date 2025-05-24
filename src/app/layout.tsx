import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '로그제조기 올인원',
  description: '모든 설정을 한 곳에서 관리하는 스마트 웹로그 생성기',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
} 
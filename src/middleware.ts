export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/discover/:path*",
    "/chat/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/verify/:path*",
    "/events/:path*",
    "/premium/:path*",
    "/store/:path*",
    "/reels/:path*"
  ]
};

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/',            // 👈 Add this line to protect root route
  '/dashboard(.*)',
  '/forum(.*)',
]);


const middleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
}, {
  // 👇 Add these redirect options here
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
});

export default middleware;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

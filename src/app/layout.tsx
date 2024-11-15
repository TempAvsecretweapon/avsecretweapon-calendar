import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Suspense } from "react";

import "./globals.css";

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </ChakraProvider>
      </body>
    </html>
  );
}

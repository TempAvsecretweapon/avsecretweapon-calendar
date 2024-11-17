import { ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return <Flex justify={"center"}>{children}</Flex>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Box, Text, Button } from "@chakra-ui/react";

const CallbackPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setIsLoading(false);
      return;
    }

    const fetchTokens = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/auth/callback?code=${code}`);
        const data = await res.json();

        if (res.ok) {
          console.log("Fetched tokens:", data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [code]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box p={5}>
      <Text>Authentication Successful!</Text>
      <Button onClick={() => router.push("/")} mt={3}>Go to Home</Button>
    </Box>
  );
};

export default CallbackPage;

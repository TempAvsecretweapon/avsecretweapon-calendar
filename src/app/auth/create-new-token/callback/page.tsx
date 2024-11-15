"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Box, Text, Button } from "@chakra-ui/react";

const CallbackPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setError("No code provided in URL.");
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
        } else {
          setError("Failed to fetch tokens.");
        }
      } catch (err) {
        setError("Error occurred while fetching tokens.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [code]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (error) {
    return <Box color="red.500">Error: {error}</Box>;
  }

  return (
    <Box p={5}>
      <Text>Authentication Successful!</Text>
      <Button onClick={() => router.push("/")} mt={3}>Go to Home</Button>
    </Box>
  );
};

export default CallbackPage;

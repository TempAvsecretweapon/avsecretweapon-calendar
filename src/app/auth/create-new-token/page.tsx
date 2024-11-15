"use client";

import { useState } from "react";
import { Button, Input, Box, FormControl, FormLabel, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { generateAuthUrl } from "@/app/lib/google-oauth";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

const CreateNewTokenPage = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordSubmit = () => {
    if (password === process.env.NEXT_PUBLIC_AUTH_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password.");
    }
  };

  const handleGenerateToken = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(SCOPES.join(" "))}&access_type=offline&prompt=consent`;
  
    window.location.href = authUrl; 
  };

  if (!isAuthenticated) {
    return (
      <Box maxW="sm" mx="auto" mt="10" p="5" borderWidth="1px" borderRadius="lg" boxShadow="md">
        <Text fontSize="2xl" mb="4">Enter Password</Text>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </FormControl>
        <Button
          mt="4"
          colorScheme="blue"
          onClick={handlePasswordSubmit}
          width="100%"
        >
          Submit
        </Button>
        {error && <Text color="red.500" mt="2">{error}</Text>}
      </Box>
    );
  }

  return (
    <Box maxW="sm" mx="auto" mt="10" p="5" borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Text fontSize="2xl" mb="4">Generate a New Refresh Token</Text>
      <Button colorScheme="green" onClick={handleGenerateToken} width="100%">
        Generate Token
      </Button>
    </Box>
  );
};

export default CreateNewTokenPage;

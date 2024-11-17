import {
  Button,
  ComponentWithAs,
  ButtonProps,
  Box,
  Text,
} from "@chakra-ui/react";

interface IntakeButtonProps extends ButtonProps {
  error?: string | null | JSX.Element;
  mt?: string | number;
}

const IntakeButton: ComponentWithAs<"button", IntakeButtonProps> = (props) => {
  return (
    <Box mt={props.mt}>
      <Text color={"red"} mb={2}>
        {props?.error}
      </Text>
      <Button
        _hover={{}}
        mt={0}
        fontSize={"lg"}
        fontWeight={"semibold"}
        borderRadius={"5px"}
        height={"60px"}
        bg={"brandPrimary.500"}
        width={"100%"}
        color={"white"}
        {...props}
      >
        {props.children}
      </Button>
    </Box>
  );
};

export default IntakeButton;

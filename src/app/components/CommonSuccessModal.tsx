import { Flex, Text } from "@chakra-ui/react";
import CommonModal from "./CommonModal";
import Image from "next/image";
import { FC } from "react";
import CommonButton from "./CommonButton";

const CommonSuccessModal: FC<{
  open: boolean;
  onClose: () => void;
  text: string;
  subtext: any;
  image: any;
}> = ({ open, onClose, text, subtext, image }) => {
  return (
    <CommonModal isOpen={open} onCloseModal={onClose}>
      <Flex
        direction={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Flex
          mt={3}
          color={"brand.secondary.1.300"}
          cursor={"pointer"}
          bg={"#F7F7F7"}
          height={"80px"}
          border={"1px solid"}
          borderColor={"gray.200"}
          alignItems={"center"}
          borderRadius={"8px"}
          justifyContent={"center"}
          width={"80px"}
        >
          <Image src={image} alt="subscription icon" height={66} width={66} />
        </Flex>
        <Text
          mt={6}
          textAlign={"center"}
          fontWeight={"600"}
          fontFamily={"Switzer-Variable"}
          color={"brand.dark.1.500"}
          fontSize={"20px"}
        >
          {text}
        </Text>
        <Text
          mt={4}
          textAlign={"center"}
          fontSize={"sm"}
          fontWeight={"normal"}
        >
          {subtext}
        </Text>
        <CommonButton mt={6} onClick={onClose}>
          Got it
        </CommonButton>
      </Flex>
    </CommonModal>
  );
};

export default CommonSuccessModal;

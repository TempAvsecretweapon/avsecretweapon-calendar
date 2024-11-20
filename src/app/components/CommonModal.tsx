import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

const CommonModal = ({
  hideClose,
  isOpen,
  onCloseModal,
  children,
  maxWidth,
}: {
  hideClose?: boolean;
  isOpen: boolean;
  onCloseModal: () => void;
  children: any;
  maxWidth?: number | string;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCloseModal} blockScrollOnMount={false}>
      <ModalOverlay />
      <ModalContent
        width={"100%"}
        px={{ base: "0px", lg: "30px" }}
        maxWidth={maxWidth ? maxWidth : "650px"}
        mx={2}
        top={0}
      >
        {hideClose ? null : <ModalCloseButton />}
        <ModalBody maxHeight={"650px"} overflow={"auto"} pt={10} pb={6}>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CommonModal;

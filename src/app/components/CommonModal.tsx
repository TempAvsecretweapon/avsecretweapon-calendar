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
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent
        width={"100%"}
        px={{ base: "10px", lg: "30px" }}
        maxWidth={maxWidth ? maxWidth : "650px"}
        mx={5}
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

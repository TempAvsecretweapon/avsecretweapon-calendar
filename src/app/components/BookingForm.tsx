import { useState } from "react";
import { Box, Input } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import CommonButton from "./CommonButton";
import moment from "moment";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { format, isValidPhoneNumber } from "libphonenumber-js";

const BookingForm = ({
  onCloseModal,
  onRefresh,
  bookingData,
}: {
  onCloseModal?: () => void;
  onRefresh: () => void;
  bookingData: any;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingInfo, setBookingInfo] = useState<any>(bookingData);
  const toast = useToast();

  const validateFields = () => {
    const { name, email, phone } = bookingInfo;

    // Name validation
    if (!name || name.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Name cannot be empty.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Phone number validation
    let formattedNumber = format(phone, 'E.164');
    if (!isValidPhoneNumber(formattedNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);
      await bookAppointment();
    } catch (e: any) {
      toast({
        title: "Error booking appointment",
        description:
          e?.message || "Something went wrong. Please contact support.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    console.log(bookingInfo);
  };

  const updateBookingdInfo = (key: string, value: string) => {
    setBookingInfo({ ...bookingInfo, [key]: value });
  };

  return (
    <Box width={"100%"}>
      <Box>
        <Input
          variant="flushed"
          placeholder="Time"
          fontSize="lg"
          _placeholder={{
            color: "gray.300",
            fontFamily: "Switzer-Medium",
          }}
          contentEditable={false}
          isReadOnly
          value={`${moment(bookingInfo.time).format(
            "YYYY-MM-DD hh:mm a"
          )} - ${moment(bookingInfo.time)
            .add(bookingInfo.duration, "hours")
            .format("hh:mm a")}`}
        />
      </Box>
      <Box mt={6}>
        <Input
          variant="flushed"
          placeholder="Resource"
          fontSize="lg"
          _placeholder={{
            color: "gray.300",
            fontFamily: "Switzer-Medium",
          }}
          contentEditable={false}
          isReadOnly
          value={bookingInfo.resource}
        />
      </Box>
      <Box mt={6}>
        <Input
          variant="flushed"
          placeholder="Name"
          onChange={(e: any) => updateBookingdInfo("name", e.target.value)}
          fontSize="lg"
          _placeholder={{ color: "gray.500" }}
        />
      </Box>

      <Box mt={6}>
        <Input
          variant="flushed"
          placeholder="Email"
          onChange={(e: any) => updateBookingdInfo("email", e.target.value)}
          fontSize="lg"
          _placeholder={{ color: "gray.500" }}
        />
      </Box>

      <Box mt={6}>
        <PhoneInput
          defaultCountry="US"
          limitMaxLength={true}
          className="phoneInputCustom"
          placeholder="Phone Number"
          onChange={(value) => {
            if (value) {
              updateBookingdInfo("phone", value);
            }
          }}
        />
      </Box>

      <CommonButton
        pl={10}
        pr={10}
        mt={8}
        py={5}
        mb={"20px"}
        onClick={onSubmit}
        isLoading={loading}
      >
        Book Appointment
      </CommonButton>
    </Box>
  );
};

export default BookingForm;

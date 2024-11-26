import { useState } from "react";
import { Box, Input, Textarea } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import CommonButton from "./CommonButton";
import moment from "moment";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { format, isValidPhoneNumber } from "libphonenumber-js";

const BookingForm = ({
  onCloseModal,
  openSuccessModal,
  bookingData,
}: {
  onCloseModal: () => void;
  openSuccessModal: () => void;
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
        duration: 2000,
        isClosable: true,
        position: "top",
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
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      return false;
    }

    // Phone number validation
    let formattedNumber = format(phone, "E.164");
    if (!isValidPhoneNumber(formattedNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
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
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    try {
      // Extract the start time and calculate the end time
      const startTime = bookingInfo.time.split("T")[1].substring(0, 5);
      const [hours, minutes] = startTime.split(":").map(Number);
      const endTime = new Date();
      endTime.setHours(hours + bookingInfo.duration, minutes);

      const formattedEndTime = `${String(endTime.getHours()).padStart(
        2,
        "0"
      )}:${String(endTime.getMinutes()).padStart(2, "0")}`;

      // Map bookingInfo to match the Appointment schema
      const appointmentData = {
        name: bookingInfo.name,
        email: bookingInfo.email,
        date: bookingInfo.time.split("T")[0],
        startTime: startTime,
        endTime: formattedEndTime,
        duration: bookingInfo.duration,
        resource: bookingInfo.resource,
        description: bookingInfo?.description || "",
        status: "confirmed",
        attendees: bookingInfo.attendee.map(
          (attendee: { _id: any }) => attendee._id
        ),
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!res.ok) {
        throw new Error(`Failed to create appointment: ${res.status}`);
      }

      const data = await res.json();
      console.log("Appointment booked successfully:", data);

      onCloseModal();
      openSuccessModal();
    } catch (error: any) {
      console.error("Failed to book appointment:", error.message);
    }
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
      <Box mt={4}>
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
      <Box mt={4}>
        <Input
          variant="flushed"
          placeholder="Name"
          onChange={(e: any) => updateBookingdInfo("name", e.target.value)}
          fontSize="lg"
          _placeholder={{ color: "gray.500" }}
        />
      </Box>

      <Box mt={4}>
        <Input
          variant="flushed"
          placeholder="Email"
          onChange={(e: any) => updateBookingdInfo("email", e.target.value)}
          fontSize="lg"
          _placeholder={{ color: "gray.500" }}
        />
      </Box>

      <Box mt={4}>
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

      <Box mt={4}>
        <Textarea
          variant="flushed"
          placeholder="Description of work"
          fontSize="lg"
          _placeholder={{ color: "gray.500" }}
          onChange={(e: any) =>
            updateBookingdInfo("description", e.target.value)
          }
          resize="vertical" // Allows resizing vertically only
        />
      </Box>

      <CommonButton
        pl={10}
        pr={10}
        mt={5}
        py={5}
        mb={"15px"}
        onClick={onSubmit}
        isLoading={loading}
      >
        Book Appointment
      </CommonButton>
    </Box>
  );
};

export default BookingForm;

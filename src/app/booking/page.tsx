"use client";

import {
  Button,
  Box,
  Flex,
  Text,
  Select,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogBody,
  Divider,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useMemo } from "react";
// import CommonButton from "@/app/components/CommonButton";
import momentTZ from "moment-timezone";
import moment from "moment";
import { createConfirmation, confirmable } from "@/app/providers/confirmation";
import { FaRegCalendarCheck } from "react-icons/fa";
import { BsQuestionCircleFill } from "react-icons/bs";
import DayTile from "../components/DayTile";
import TimeTile from "../components/TimeTile";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import axiosClient from "../lib/axios-client";

const ConfirmModal = ({ show, proceed, confirmation }: any) => {
  const cancelRef = React.useRef<any>();
  return (
    <AlertDialog
      isOpen={show}
      onClose={() => proceed(false)}
      leastDestructiveRef={cancelRef}
      isCentered
      size="xs"
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogBody>
            <Flex
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              py="5"
            >
              <BsQuestionCircleFill color="#0074c6" fontSize="4.5rem" />
              <Text fontWeight="bold" fontSize="2xl" mt="5" mb="2">
                Are you sure?
              </Text>
            </Flex>
            <Divider />
            <Flex
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              py="5"
            >
              <Flex my="1" alignItems="center">
                <FaRegCalendarCheck />{" "}
                <Text mx="2" fontWeight="500">
                  {moment(confirmation).format("h:mma")} -{" "}
                  {moment(confirmation).add(15, "minutes").format("h:mma")}
                </Text>
              </Flex>
              <Flex my="1" alignItems="center">
                <Text mx="2" fontWeight="500">
                  {moment(confirmation).format("dddd, MMM Do, YYYY")}
                </Text>
              </Flex>
            </Flex>
            <Divider />
            <Button
              width="100%"
              colorScheme="blue"
              mt={4}
              onClick={() => proceed(true)}
            >
              Yes
            </Button>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

const confirm = createConfirmation(confirmable(ConfirmModal));

const BookingPage = () => {
  const [loading, setLoading] = React.useState(false);
  const [timezone, setTimezone] = React.useState(momentTZ.tz.guess());
  const [availableSlots, setAvailableSlots] = React.useState([]);
  const [resources, setResources] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState<any>();
  const [selectedResource, setSelectedResource] = React.useState("");
  const [selectedDuration, setSelectedDuration] = React.useState(0);
  const [slots, setSlots] = React.useState([]);
  const [filteredSlots, setFilteredSlots] = React.useState([]);
  const toast = useToast();

  const durations = [2, 4, 6, 8, 10];

  const fetchSlots = async () => {
    try {
      const response = await axiosClient.get(`/api/appointments/getAvailableSlots`);
      setSlots(response.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await axiosClient.get("/api/resources");
      setResources(response.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  useEffect(() => {
    (async function fetchResourcesAndSlots() {
      try {
        setLoading(true);
        await fetchResources();
        await fetchSlots();
      } catch (e) {
        console.log(e);
        toast({
          title: "Failed to load resources.",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const generateNext30Days = () => {
    const dates = [];
    const timezone = "America/Chicago"; // CST timezone
    for (let i = 1; i <= 30; i++) {
      const date = moment().tz(timezone).add(i, "days").format("YYYY-MM-DD");
      dates.push(date);
    }
    return dates;
  };

  const next30Days = generateNext30Days();

  const handleResourceChange = (id: string) => {
    setSelectedResource(id);
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
  };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    const selectedDateSlots = slots.find((slot: any) => slot.date === date);
    if (selectedDateSlots) {
      setFilteredSlots(selectedDateSlots);
      console.log(selectedDateSlots);
    } else {
      console.error("No slots found for selected date");
    }
  };

  const bookAppointment = async (date: any) => {
    if (!(await confirm({ confirmation: moment.tz(date, timezone) }))) {
      return;
    }

    setLoading(true);

    try {
      console.log("booked");
    } catch (e) {
      console.error(e);
      toast({
        title: "Error occurred while booking appointment",
        status: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Box width={{ base: "100%", md: "60vw" }}>
      <Text
        fontSize={"35px"}
        fontWeight={"bold"}
        color={"textColor.heading"}
        fontFamily={"Switzer-Variable"}
        textAlign={"center"}
      >
        Book Appointment with Technical Teams
      </Text>

      <Box justifyContent="center">
        {loading && (
          <Modal isOpen={loading} onClose={() => {}} isCentered>
            <ModalOverlay />
            <ModalContent background="transparent" boxShadow="none">
              <Flex width="100%" justifyContent={"center"}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="brandPrimary.600"
                  size="xl"
                />
              </Flex>
            </ModalContent>
          </Modal>
        )}

        <Box mt="5">
          <Box borderTop="1px" borderColor="#ebeef1" py="5">
            <h2>
              <Box
                border="1px"
                borderColor="#ebeef1"
                borderRadius="full"
                as="span"
                px="3"
              >
                01
              </Box>
              <Box as="span" px="3">
                Choose Timezone
              </Box>
            </h2>
            <Box mx="auto" maxWidth="90%" p={4}>
              <Select
                variant="unstyled"
                placeholder="Select your timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {momentTZ.tz.names().map((timezone: any, idx: any) => (
                  <option key={idx}>{timezone}</option>
                ))}
              </Select>
            </Box>
          </Box>

          <Box borderTop="1px" borderColor="#ebeef1" py="5">
            <Flex>
              <h2 style={{ flex: "1" }}>
                <Box
                  border="1px"
                  borderColor="#ebeef1"
                  borderRadius="full"
                  as="span"
                  px="3"
                >
                  02
                </Box>
                <Box as="span" px="3">
                  Choose Resource
                </Box>
              </h2>
            </Flex>
            <Box mx="auto" maxWidth="90%" p={4}>
              {/* Line 1: Level 1 Tech ~ Level 3 Tech */}
              <Flex flexWrap="wrap" gap={4}>
                {resources
                  .filter((resource: any) => resource.name.includes("Tech"))
                  .map((resource: any) => (
                    <Flex key={resource._id} alignItems="center">
                      <input
                        type="checkbox"
                        checked={selectedResource === resource._id}
                        onChange={() => handleResourceChange(resource._id)}
                      />
                      <Text ml={3}>{resource.name}</Text>
                    </Flex>
                  ))}
              </Flex>

              {/* Line 2: Teams */}
              <Flex flexWrap="wrap" gap={4} mt={4}>
                {resources
                  .filter((resource: any) => resource.name.includes("Team"))
                  .map((resource: any) => (
                    <Flex key={resource._id} alignItems="center">
                      <input
                        type="checkbox"
                        checked={selectedResource === resource._id}
                        onChange={() => handleResourceChange(resource._id)}
                      />
                      <Text ml={3}>{resource.name}</Text>
                    </Flex>
                  ))}
              </Flex>

              {resources.length === 0 && (
                <Box textAlign="center" color="#A8A8A8">
                  No resources available.
                </Box>
              )}
            </Box>
          </Box>

          <Box borderTop="1px" borderColor="#ebeef1" py="5">
            <Flex>
              <h2 style={{ flex: "1" }}>
                <Box
                  border="1px"
                  borderColor="#ebeef1"
                  borderRadius="full"
                  as="span"
                  px="3"
                >
                  03
                </Box>
                <Box as="span" px="3">
                  Choose Duration
                </Box>
              </h2>
            </Flex>
            <Box mx="auto" maxWidth="90%" p={4}>
              <Flex flexWrap="wrap" gap={4}>
                {durations.map((duration: any) => (
                  <Flex key={duration} alignItems="center">
                    <input
                      type="checkbox"
                      checked={selectedDuration === duration}
                      onChange={() => handleDurationChange(duration)}
                    />
                    <Text ml={3}>{duration} hrs</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </Box>

          <Box borderTop="1px" borderColor="#ebeef1" py="5">
            <Flex>
              <h2 style={{ flex: "1" }}>
                <Box
                  border="1px"
                  borderColor="#ebeef1"
                  borderRadius="full"
                  as="span"
                  px="3"
                >
                  04
                </Box>
                <Box as="span" px="3">
                  Choose Day
                </Box>
              </h2>
            </Flex>
            <Box mx="auto" maxWidth="90%" p={4}>
              <Carousel
                draggable
                arrows
                responsive={{
                  desktop: {
                    breakpoint: {
                      max: 3000,
                      min: 1024,
                    },
                    items: 8,
                    partialVisibilityGutter: 40,
                  },
                  mobile: {
                    breakpoint: {
                      max: 464,
                      min: 0,
                    },
                    items: 3,
                    partialVisibilityGutter: 30,
                  },
                  tablet: {
                    breakpoint: {
                      max: 1024,
                      min: 464,
                    },
                    items: 4,
                    partialVisibilityGutter: 30,
                  },
                }}
                slidesToSlide={3}
              >
                {next30Days.map((date, key) => (
                  <DayTile
                    key={key}
                    date={date}
                    active={date == selectedDate}
                    onSelect={() => handleDateChange(date)}
                  />
                ))}
              </Carousel>
            </Box>
          </Box>

          <Box borderTop="1px" borderColor="#ebeef1" py="5">
            <h2>
              <Box
                border="1px"
                borderColor="#ebeef1"
                borderRadius="full"
                as="span"
                px="3"
              >
                05
              </Box>
              <Box as="span" px="3">
                Choose Start Time
              </Box>
            </h2>
            <Box mx="auto" maxWidth="90%" p={4}>
              <Carousel
                draggable
                arrows
                responsive={{
                  desktop: {
                    breakpoint: {
                      max: 3000,
                      min: 1024,
                    },
                    items: 8,
                    partialVisibilityGutter: 40,
                  },
                  mobile: {
                    breakpoint: {
                      max: 464,
                      min: 0,
                    },
                    items: 3,
                    partialVisibilityGutter: 30,
                  },
                  tablet: {
                    breakpoint: {
                      max: 1024,
                      min: 464,
                    },
                    items: 5,
                    partialVisibilityGutter: 30,
                  },
                }}
                slidesToSlide={3}
              >
                <></>
                {/* {slots[selectedDate] ? (
                  slots[selectedDate].map((time: any, key: number) => (
                    <TimeTile
                      key={key}
                      time={time}
                      timezone={timezone}
                      active={false}
                      onSelect={(d: any) => bookAppointment(d)}
                    />
                  ))
                ) : (
                  <></>
                )} */}
              </Carousel>
              {/* {!slots[selectedDate] && (
                <Box textAlign="center" color="#A8A8A8">
                  No available hours
                </Box>
              )} */}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BookingPage;

"use client";

import {
  Box,
  Flex,
  Text,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  useToast,
  Select,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
// import moment from "moment";
// import DayTile from "../components/DayTile";
import TimeTile from "../components/TimeTile";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { calculateAvailableStartTimes } from "../lib/availableStartTimeCalculator";
import CommonModal from "../components/CommonModal";
import BookingForm from "../components/BookingForm";
import CommonSuccessModal from "../components/CommonSuccessModal";
import checkIcon from "@/app/assets/images/checkbox.svg";
import Calendar, { OnArgs } from "react-calendar";
import "react-calendar/dist/Calendar.css";

// const timezone = "America/Chicago"; // CST timezone

const BookingPage = () => {
  const [loading, setLoading] = useState(false);

  const [resources, setResources] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    const formattedMonth = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
    return formattedMonth;
  });
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeAndAttendee, setSelectedTimeAndAttendee] = useState({});
  const [openBookingForm, setOpenBookingForm] = useState(false);
  const [filteredSlots, setFilteredSlots] = useState<{
    technicians: any[];
    date: string;
  }>({ technicians: [], date: "" });

  const [availableStartTimes, setAvailableStartTimes] = React.useState<any[]>(
    []
  );
  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);
  const toast = useToast();

  const durations = [2, 4, 6, 8, 10];

  const fetchSlots = async () => {
    try {
      const res = await fetch(
        `/api/appointments/getAvailableSlots?month=${selectedMonth}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch slots: ${res.status}`);
      }

      const data = await res.json();
      setSlots(data);
      console.log("available slots: ", data);

      if (selectedDate) {
        const selectedDateSlots = data.find(
          (slot: any) => slot.date === selectedDate
        );
        if (selectedDateSlots) {
          setFilteredSlots(selectedDateSlots);
        } else {
          console.error("No slots found for selected date");
        }
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const fetchResources = async () => {
    if (resources.length > 0) return;

    try {
      const res = await fetch("/api/resources");

      if (!res.ok) {
        throw new Error(`Failed to fetch resources: ${res.status}`);
      }

      const data = await res.json();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const fetchResourcesAndSlots = async () => {
    try {
      setLoading(true);
      await fetchResources();
      await fetchSlots();
    } catch (e) {
      console.log(e);
      toast({
        title: "Failed to load data.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesAndSlots();
  }, [selectedMonth]);

  const updateAvailableStartTimes = async () => {
    if (!selectedResource || !selectedDuration || !selectedDate) return;

    setLoading(true);
    try {
      const availableTimes: any[] = await calculateAvailableStartTimes(
        resources,
        selectedResource,
        selectedDuration,
        filteredSlots
      );

      setAvailableStartTimes(availableTimes);
    } catch (e) {
      console.log(e);
      toast({
        title: "Failed to updte start times.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateAvailableStartTimes();
  }, [selectedResource, selectedDuration, filteredSlots]);

  const handleResourceChange = (id: string) => {
    setSelectedResource(id);
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
  };

  const handleDateChange = (date: Date) => {
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    const formattedDate = localDate.toLocaleDateString("en-CA");

    setSelectedDate(formattedDate);

    const formattedMonth = `${localDate.getFullYear()}-${(
      localDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;

    if (formattedMonth != selectedMonth) {
      setSelectedMonth(formattedMonth);
      return;
    }

    const selectedDateSlots = slots.find(
      (slot: any) => slot.date === formattedDate
    );
    console.log(formattedDate, selectedDateSlots);
    if (selectedDateSlots) {
      setFilteredSlots(selectedDateSlots);
    } else {
      console.error("No slots found for selected date");
      setFilteredSlots({ technicians: [], date: "" });
    }
  };

  const handleTimeChange = (data: any) => {
    setSelectedTimeAndAttendee(data);
    setOpenBookingForm(true);
  };

  const refresh = async () => {
    setLoading(true);
    await fetchSlots();
    setLoading(true);
  };

  const handleCloseSuccessModal = () => {
    setOpenSuccessModal(false);
    refresh();
  };

  return (
    <Box width={{ base: "100%", md: "60vw" }}>
      <Text
        fontSize={{ base: "1.7rem", md: "2.2rem" }}
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
          {/* <Box borderTop="1px" borderColor="#ebeef1" py="5">
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
          </Box> */}

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
                  01
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
                  02
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
                  03
                </Box>
                <Box as="span" px="3">
                  Choose Day
                </Box>
              </h2>
            </Flex>
            <Box mx="auto" maxWidth="90%" p={4}>
              <Calendar
                onChange={(value) => handleDateChange(value as Date)}
                locale="en-US"
                className="calender-body"
              />
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
                04
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
                {availableStartTimes.length ? (
                  availableStartTimes.map((item: any, key: number) => {
                    const combinedDateTime = `${selectedDate}T${item.time}`;
                    return (
                      <TimeTile
                        key={key}
                        time={combinedDateTime}
                        attendee={item.attendee}
                        active={false}
                        onSelect={(d: any) => handleTimeChange(d)}
                      />
                    );
                  })
                ) : (
                  <></>
                )}
              </Carousel>
              {!availableStartTimes.length && (
                <Box textAlign="center" color="#A8A8A8">
                  No available hours
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <CommonModal
        isOpen={openBookingForm}
        onCloseModal={() => setOpenBookingForm(false)}
      >
        <></>
        <BookingForm
          onCloseModal={() => setOpenBookingForm(false)}
          openSuccessModal={() => setOpenSuccessModal(true)}
          bookingData={{
            resource: (() => {
              const resource: any = resources.find(
                (res: { _id: any }) => res._id === selectedResource
              );
              return resource ? resource.name : "Unknown Resource";
            })(),
            duration: selectedDuration,
            ...selectedTimeAndAttendee,
          }}
        />
      </CommonModal>

      <CommonSuccessModal
        open={openSuccessModal}
        onClose={() => handleCloseSuccessModal()}
        text={"Your appointment has been successfully booked."}
        subtext={
          "Please reach out to support@avsecretweapon.com if you have any questions."
        }
        image={checkIcon}
      />
    </Box>
  );
};

export default BookingPage;

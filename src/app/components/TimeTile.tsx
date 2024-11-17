import { Flex, Text } from "@chakra-ui/react";
import moment from "moment";

const TimeTile = ({
  time,
  timezone,
  active = false,
  onSelect,
}: {
  time: string;
  timezone: string;
  active: boolean;
  onSelect: (d: string) => void;
}) => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      width="65px"
      height="63px"
      border="1px"
      borderColor={active ? "#0074c6" : "#ebeef1"}
      borderRadius="2xl"
      bg={active ? "#0074c6" : "white"}
      cursor="pointer"
      onClick={() => onSelect(time)}
    >
      <Text color={active ? "white" : "black"} fontWeight="bold" fontSize="md">
        {moment(time).tz(timezone).format("h:mm")}
      </Text>
      <Text color={active ? "white" : "black"} fontSize="x-small">
        {moment(time).tz(timezone).format("A")}
      </Text>
    </Flex>
  );
};
export default TimeTile;

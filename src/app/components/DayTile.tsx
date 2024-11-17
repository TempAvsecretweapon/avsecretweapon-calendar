import { Flex, Text } from "@chakra-ui/react";
import moment from "moment";

const DayTile = ({
  date,
  active = false,
  onSelect,
}: {
  date: string;
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
      onClick={() => onSelect(date)}
    >
      <Text color={active ? "white" : "black"} fontSize="x-small">
        {moment(date).format("ddd")}
      </Text>
      <Text color={active ? "white" : "black"} fontSize="xl" fontWeight="bold">
        {moment(date).format("D")}
      </Text>
    </Flex>
  );
};

export default DayTile;

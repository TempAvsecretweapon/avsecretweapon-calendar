const timeToSlotNumber = async (str: string) => {
  return Math.floor(
    (parseInt(str.split(":")[0], 10) - 7) * 2 +
      parseInt(str.split(":")[1], 10) / 30
  );
};

const findAvailableResource = async (
  start: number,
  duration: number,
  level: number,
  technicians: any[],
  bookedTechs: any[]
) => {
  for (const item of technicians) {
    if (
      item.technician.level !== level ||
      bookedTechs.some(
        (bookedTech) => bookedTech.technician._id === item.technician._id
      )
    ) {
      continue;
    }

    let isAvailable: boolean = true;
    for (let t = start; t < start + duration; t++) {
      if (!item.availableSlots[t]) {
        isAvailable = false;
        break;
      }
    }

    if (isAvailable) {
      return item;
    }
  }

  return null;
};

const checkStartTimeIsAvailable = async (
  start: number,
  duration: number,
  resourceType: string,
  resourceLevel: number,
  technicians: any
) => {
  const bookedTechs: any[] = [];

  if (resourceType === "tech") {
    const tech = await findAvailableResource(
      start,
      duration,
      resourceLevel,
      technicians,
      bookedTechs
    );

    if (tech) return { success: true, attendee: [tech] };
    return { success: false, attendee: [] };
  } else if (resourceType === "team") {
    const tech = await findAvailableResource(
      start,
      duration,
      resourceLevel,
      technicians,
      bookedTechs
    );
    if (!tech) return { success: false, attendee: [] };

    bookedTechs.push(tech);

    let assist = await findAvailableResource(
      start,
      duration,
      1,
      technicians,
      bookedTechs
    );
    if (assist) {
      bookedTechs.push(assist);
      return { success: true, attendee: bookedTechs };
    }

    assist = await findAvailableResource(
      start,
      duration,
      2,
      technicians,
      bookedTechs
    );
    if (assist) {
      bookedTechs.push(assist);
      return { success: true, attendee: bookedTechs };
    }

    return { success: false, attendee: [] };
  } else if (resourceType === "all") {
    for (const item of technicians) {
      const tech = await findAvailableResource(
        start,
        duration,
        item.technician.level,
        technicians,
        bookedTechs
      );

      if (!tech) return { success: false, attendee: [] };
      bookedTechs.push(tech);
    }
    return { success: true, attendee: bookedTechs };
  }

  return { success: false, attendee: [] };
};

export const calculateAvailableStartTimes = async (
  resources: any[],
  selectedResourceId: any,
  selectedDuration: any,
  filteredSlots: { technicians: any[] }
) => {
  if (!selectedResourceId || !selectedDuration || !filteredSlots?.technicians) {
    return [];
  }

  const selectedResource = resources.find(
    (res: { _id: any }) => res._id === selectedResourceId
  );
  if (!selectedResource) return [];

  const resourceLevel = selectedResource.level || 0;

  //   console.log(selectedResource, resourceLevel);

  const startTimeSlot = await timeToSlotNumber(
    selectedResource.availability.start
  );
  const endTimeSlot = await timeToSlotNumber(selectedResource.availability.end);
  const duration = 2 * selectedDuration;

  // Get availableSlots by checking all the start times
  const availableSlots: any[] = [];
  for (let start = startTimeSlot; start <= endTimeSlot - duration; start++) {
    const { success, attendee } = await checkStartTimeIsAvailable(
      start,
      duration,
      selectedResource.type,
      selectedResource.level,
      filteredSlots.technicians
    );

    if (success) {
      const hours = 7 + Math.floor(start / 2);
      const minutes = (start % 2) * 30;
      const time = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;

      availableSlots.push({ time: time, attendee: attendee });
    }
  }

  return availableSlots;
};

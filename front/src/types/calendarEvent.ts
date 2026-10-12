import { EventInput } from "@fullcalendar/core";

export interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    description?: string;
    location?: string;
  };
}
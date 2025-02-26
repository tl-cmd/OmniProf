import { Event, InsertEvent } from "@shared/schema";

/**
 * Parse an iCal file and convert it to Event objects
 * @param icalString The iCal file content as a string
 * @param teacherId The ID of the teacher to associate with the events
 * @returns Array of events parsed from the iCal file
 */
export function parseIcalToEvents(icalString: string, teacherId: number): InsertEvent[] {
  // This is a simple implementation for demonstration purposes
  // In a real application, use a library like node-ical to parse iCal files properly
  
  const events: InsertEvent[] = [];
  
  // Split the iCal file by events (VEVENT blocks)
  const eventBlocks = icalString.split('BEGIN:VEVENT');
  eventBlocks.shift(); // Remove the first part (not an event)
  
  for (const block of eventBlocks) {
    const endIndex = block.indexOf('END:VEVENT');
    if (endIndex === -1) continue;
    
    const eventData = block.substring(0, endIndex);
    
    // Extract event properties
    const summary = extractProperty(eventData, 'SUMMARY');
    const description = extractProperty(eventData, 'DESCRIPTION');
    const dtStart = extractProperty(eventData, 'DTSTART');
    const dtEnd = extractProperty(eventData, 'DTEND');
    
    // Skip events without required properties
    if (!summary || !dtStart || !dtEnd) continue;
    
    // Parse dates
    let startDate: Date;
    let endDate: Date;
    
    try {
      // Handle different date formats in iCal
      if (dtStart.includes('T')) {
        startDate = new Date(dtStart.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z'));
      } else {
        startDate = new Date(dtStart.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      }
      
      if (dtEnd.includes('T')) {
        endDate = new Date(dtEnd.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z'));
      } else {
        endDate = new Date(dtEnd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      }
    } catch (e) {
      // Skip events with invalid dates
      continue;
    }
    
    // Determine event type based on title/description
    let type = 'class';
    if (summary.toLowerCase().includes('exam') || summary.toLowerCase().includes('évaluation')) {
      type = 'assessment';
    } else if (summary.toLowerCase().includes('meeting') || summary.toLowerCase().includes('réunion')) {
      type = 'meeting';
    }
    
    // Extract class ID from summary if possible
    let classId: number | undefined = undefined;
    const classMatch = summary.match(/\b(\d+)([A-Z])\b/); // Match patterns like "3A", "4B"
    if (classMatch) {
      // In a real app, we would query the database to find the class ID
      // For simplicity, we're leaving it undefined
    }
    
    events.push({
      title: summary,
      description: description || '',
      startDate,
      endDate,
      teacherId,
      classId,
      type
    });
  }
  
  return events;
}

/**
 * Extract a property value from an iCal event string
 * @param eventData The event data string
 * @param property The property name to extract
 * @returns The property value, or undefined if not found
 */
function extractProperty(eventData: string, property: string): string | undefined {
  const regex = new RegExp(`${property}(?:[;][^:]*)?:([^\\r\\n]+)`);
  const match = eventData.match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Generate an iCal file from a list of events
 * @param events The events to include in the iCal file
 * @returns The iCal file content as a string
 */
export function generateIcalFromEvents(events: Event[]): string {
  let icalContent = 'BEGIN:VCALENDAR\r\n';
  icalContent += 'VERSION:2.0\r\n';
  icalContent += 'PRODID:-//OmniProf//NONSGML v1.0//FR\r\n';
  
  for (const event of events) {
    icalContent += 'BEGIN:VEVENT\r\n';
    
    // Format dates according to iCal format (YYYYMMDDTHHMMSSZ)
    const startDate = formatDateToIcal(event.startDate);
    const endDate = formatDateToIcal(event.endDate);
    
    icalContent += `DTSTART:${startDate}\r\n`;
    icalContent += `DTEND:${endDate}\r\n`;
    icalContent += `SUMMARY:${event.title}\r\n`;
    
    if (event.description) {
      icalContent += `DESCRIPTION:${event.description}\r\n`;
    }
    
    // Add a unique identifier
    icalContent += `UID:${event.id}@omniprof.app\r\n`;
    
    icalContent += 'END:VEVENT\r\n';
  }
  
  icalContent += 'END:VCALENDAR\r\n';
  
  return icalContent;
}

/**
 * Format a Date object to iCal date format
 * @param date The date to format
 * @returns The formatted date string
 */
function formatDateToIcal(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

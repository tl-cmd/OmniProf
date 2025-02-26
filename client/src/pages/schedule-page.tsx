import { AppLayout } from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Event, Class } from "@shared/schema";
import { Plus, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, addMonths, format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, isSameDay, isSameMonth, parseISO, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type CalendarView = "day" | "week" | "month";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [view, setView] = useState<CalendarView>("week");
  
  // Calculate current view range (for header display)
  const startDate = view === "day" 
    ? selectedDate 
    : view === "week" 
      ? startOfWeek(selectedDate, { locale: fr }) 
      : startOfMonth(selectedDate);
  
  const endDate = view === "day" 
    ? selectedDate 
    : view === "week" 
      ? endOfWeek(selectedDate, { locale: fr }) 
      : endOfMonth(selectedDate);
  
  // Navigation functions
  const goToToday = () => setSelectedDate(new Date());
  
  const goToPrevious = () => {
    if (view === "day") setSelectedDate(addDays(selectedDate, -1));
    else if (view === "week") setSelectedDate(addDays(selectedDate, -7));
    else setSelectedDate(addMonths(selectedDate, -1));
  };
  
  const goToNext = () => {
    if (view === "day") setSelectedDate(addDays(selectedDate, 1));
    else if (view === "week") setSelectedDate(addDays(selectedDate, 7));
    else setSelectedDate(addMonths(selectedDate, 1));
  };
  
  // Format the header date range
  const formatDateRange = () => {
    if (view === "day") {
      return format(selectedDate, "EEEE d MMMM yyyy", { locale: fr });
    } else if (view === "week") {
      return `${format(startDate, "d", { locale: fr })} - ${format(endDate, "d MMMM yyyy", { locale: fr })}`;
    } else {
      return format(selectedDate, "MMMM yyyy", { locale: fr });
    }
  };
  
  // Fetch classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });
  
  // Fetch events
  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['/api/events', { classId: selectedClass !== "all" ? parseInt(selectedClass) : undefined }],
    queryFn: async () => {
      // In a real app, we would fetch from the API
      // For now, we'll return mock data
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      return [
        {
          id: 1,
          title: "Cours - 3e A",
          description: "Théorème de Thalès - Exercices d'application",
          startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
          endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0),
          classId: 1,
          teacherId: 1,
          type: "class",
          createdAt: new Date()
        },
        {
          id: 2,
          title: "Évaluation - 4e B",
          description: "Contrôle sur les nombres relatifs et calcul littéral",
          startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0),
          endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 0),
          classId: 2,
          teacherId: 1,
          type: "assessment",
          createdAt: new Date()
        },
        {
          id: 3,
          title: "Cours - 6e C",
          description: "Introduction aux fractions - Activité manipulatoire",
          startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 8, 0),
          endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 9, 0),
          classId: 3,
          teacherId: 1,
          type: "class",
          createdAt: new Date()
        },
        {
          id: 4,
          title: "Évaluation - 3e A",
          description: "Contrôle de géométrie - Thalès et Pythagore",
          startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 15, 0),
          endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 16, 0),
          classId: 1,
          teacherId: 1,
          type: "assessment",
          createdAt: new Date()
        },
        {
          id: 5,
          title: "Réunion parents-professeurs",
          description: "Rencontre avec les parents d'élèves",
          startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 18, 0),
          endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 20, 0),
          classId: null,
          teacherId: 1,
          type: "meeting",
          createdAt: new Date()
        }
      ].filter(event => {
        if (selectedClass !== "all" && event.classId !== parseInt(selectedClass)) {
          return false;
        }
        return true;
      });
    }
  });
  
  // Filter events for the current view
  const getEventsForDay = (day: Date) => {
    if (!events) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, day);
    });
  };
  
  const getEventsForCurrentView = () => {
    if (!events) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      
      if (view === "day") {
        return isSameDay(eventDate, selectedDate);
      } else if (view === "week") {
        const viewStart = startOfWeek(selectedDate, { locale: fr });
        const viewEnd = endOfWeek(selectedDate, { locale: fr });
        return eventDate >= viewStart && eventDate <= viewEnd;
      } else {
        return isSameMonth(eventDate, selectedDate);
      }
    });
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'assessment':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'meeting':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'class':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  // Generate day view
  const DayView = () => {
    const eventsForDay = getEventsForCurrentView();
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {hours.map(hour => {
            const timeSlot = new Date(selectedDate);
            timeSlot.setHours(hour, 0, 0);
            
            const timeSlotEvents = eventsForDay.filter(event => {
              const eventHour = new Date(event.startDate).getHours();
              return eventHour === hour;
            });
            
            return (
              <div key={hour} className="grid grid-cols-12 min-h-[80px]">
                <div className="col-span-1 py-2 px-3 border-r text-xs text-gray-500 text-right">
                  {hour}:00
                </div>
                <div className="col-span-11 py-2 px-3 relative">
                  {timeSlotEvents.length > 0 ? (
                    <div className="space-y-2">
                      {timeSlotEvents.map(event => {
                        const startTime = format(new Date(event.startDate), "HH:mm", { locale: fr });
                        const endTime = format(new Date(event.endDate), "HH:mm", { locale: fr });
                        
                        return (
                          <div 
                            key={event.id}
                            className={`p-2 rounded-md border ${getEventTypeColor(event.type)}`}
                          >
                            <div className="font-medium text-sm">{event.title}</div>
                            <div className="flex items-center text-xs mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {startTime} - {endTime}
                            </div>
                            {event.description && (
                              <div className="text-xs mt-1">{event.description}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Generate week view
  const WeekView = () => {
    const days = [];
    const weekStart = startOfWeek(selectedDate, { locale: fr });
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="py-2 px-3 text-xs font-medium text-gray-500"></div>
          {days.map((day, index) => (
            <div 
              key={index} 
              className={cn(
                "py-2 px-1 text-center border-l", 
                isToday(day) ? "bg-blue-50" : ""
              )}
            >
              <div className="text-xs font-medium">
                {format(day, "EEE", { locale: fr })}
              </div>
              <div className={cn(
                "text-sm",
                isToday(day) ? "font-bold text-blue-600" : ""
              )}>
                {format(day, "d", { locale: fr })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="divide-y divide-gray-200">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 min-h-[50px]">
              <div className="py-1 px-2 text-xs text-gray-500 text-right">
                {hour}:00
              </div>
              
              {days.map((day, dayIndex) => {
                const timeSlot = new Date(day);
                timeSlot.setHours(hour, 0, 0);
                
                const timeSlotEvents = events?.filter(event => {
                  const eventDate = new Date(event.startDate);
                  return isSameDay(eventDate, day) && eventDate.getHours() === hour;
                }) || [];
                
                return (
                  <div 
                    key={dayIndex} 
                    className={cn(
                      "py-1 px-1 border-l relative",
                      isToday(day) ? "bg-blue-50" : ""
                    )}
                  >
                    {timeSlotEvents.length > 0 ? (
                      <div className="space-y-1">
                        {timeSlotEvents.map(event => {
                          const startTime = format(new Date(event.startDate), "HH:mm", { locale: fr });
                          const endTime = format(new Date(event.endDate), "HH:mm", { locale: fr });
                          
                          return (
                            <div 
                              key={event.id}
                              className={`p-1 rounded-sm border text-xs ${getEventTypeColor(event.type)}`}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="flex items-center text-xs mt-0.5">
                                <Clock className="h-2 w-2 mr-0.5" />
                                {startTime}-{endTime}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Generate month view
  const MonthView = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-4">
        <Calendar
          mode="multiple"
          selected={[selectedDate]}
          onSelect={(date) => date && setSelectedDate(date)}
          className="w-full"
          locale={fr}
          month={selectedDate}
          classNames={{
            day_today: "bg-primary-50 text-primary-600 font-bold",
            day_selected: "bg-primary-900 text-primary-50 hover:bg-primary-900 hover:text-primary-50 focus:bg-primary-900",
          }}
          components={{
            DayContent: (props) => {
              const date = props.date;
              const eventsForDay = getEventsForDay(date);
              
              return (
                <div className="w-full h-full flex flex-col">
                  <div className="text-center">{props.date.getDate()}</div>
                  {eventsForDay.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5 justify-center">
                      {eventsForDay.length > 2 ? (
                        <div className="text-xs text-primary-600 font-medium">{eventsForDay.length} événements</div>
                      ) : (
                        eventsForDay.map((event, index) => (
                          <div 
                            key={index}
                            className={`w-2 h-2 rounded-full ${event.type === 'assessment' ? 'bg-red-500' : event.type === 'meeting' ? 'bg-amber-500' : 'bg-blue-500'}`}
                          ></div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            }
          }}
        />
      </div>
    );
  };
  
  // Event list for selected day/period
  const EventList = () => {
    const eventsForView = getEventsForCurrentView();
    
    if (isLoadingEvents) {
      return (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Événements</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-md p-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
                <div className="flex justify-end mt-2">
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Événements {view === "day" ? "du jour" : view === "week" ? "de la semaine" : "du mois"}</h3>
        {eventsForView.length > 0 ? (
          <div className="space-y-4">
            {eventsForView
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map(event => {
                const eventDate = format(new Date(event.startDate), "EEEE d MMMM", { locale: fr });
                const startTime = format(new Date(event.startDate), "HH:mm", { locale: fr });
                const endTime = format(new Date(event.endDate), "HH:mm", { locale: fr });
                
                // Find class name if available
                const className = event.classId 
                  ? classes?.find(c => c.id === event.classId)?.name || `Classe #${event.classId}`
                  : null;
                
                return (
                  <div 
                    key={event.id} 
                    className={`border rounded-md p-3 ${event.type === 'assessment' ? 'border-red-200' : event.type === 'meeting' ? 'border-amber-200' : 'border-blue-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                        {event.type === 'assessment' ? 'Évaluation' : event.type === 'meeting' ? 'Réunion' : 'Cours'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {eventDate}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {startTime} - {endTime}
                      </div>
                      {className && (
                        <div className="mt-1 text-sm text-gray-500">
                          Classe: {className}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/schedule/${event.id}`}>
                          Détails
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Aucun événement {view === "day" ? "pour ce jour" : view === "week" ? "cette semaine" : "ce mois"}.
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout title="Emploi du temps">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="px-4" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-medium ml-2 capitalize">
            {formatDateRange()}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes?.map(cls => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.level} - {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/schedule/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel événement
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="day">Jour</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
            <TabsTrigger value="month">Mois</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {view === "day" && <DayView />}
      {view === "week" && <WeekView />}
      {view === "month" && <MonthView />}
      
      <EventList />
    </AppLayout>
  );
}

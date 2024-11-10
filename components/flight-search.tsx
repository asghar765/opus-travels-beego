"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { cn } from "lib/utils";
import { Button } from "components/ui/button";
import { Calendar } from "components/ui/calendar";
import { AirportSearch } from "components/airport-search";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { toast } from "sonner";
import { FlightResults } from "./flight-results";

const formSchema = z.object({
  origin: z.string().min(3, "Please select a departure airport"),
  destination: z.string().min(3, "Please select an arrival airport"),
  departureDate: z.date({
    required_error: "Please select a departure date",
  }),
  returnDate: z.date().optional(),
  adults: z.number().min(1),
  cabinClass: z.enum(["economy", "premium_economy", "business", "first"]),
});

export function FlightSearch() {
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adults: 1,
      cabinClass: "economy",
    },
  });

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["flightSearch"],
    queryFn: async () => {
      const values = form.getValues();
      if (!values.departureDate) {
        throw new Error("Departure date is required");
      }
      const response = await fetch("/api/search-flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          departureDate: values.departureDate.toISOString().split("T")[0],
          returnDate: values.returnDate
            ? values.returnDate.toISOString().split("T")[0]
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to search flights");
      }

      return response.json();
    },
    enabled: false,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await refetch();
      toast.success("Flight search completed!");
    } catch (error) {
      toast.error("Failed to search flights. Please try again.");
    }
  }

  function handleSelectOffer(offer: any) {
    // Implement the logic to handle flight offer selection
    console.log("Selected offer:", offer);
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl rounded-xl bg-card p-6 shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={isRoundTrip ? "outline" : "default"}
                onClick={() => {
                  setIsRoundTrip(false);
                  form.setValue("returnDate", undefined);
                }}
              >
                One Way
              </Button>
              <Button
                type="button"
                variant={isRoundTrip ? "default" : "outline"}
                onClick={() => setIsRoundTrip(true)}
              >
                Round Trip
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <AirportSearch
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select departure airport"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <AirportSearch
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select arrival airport"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Departure Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date < new Date() ||
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isRoundTrip && (
                <FormField
                  control={form.control}
                  name="returnDate"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Return Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              date <
                                form.getValues().departureDate! ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Passengers</FormLabel>
                    <Select
                      onValueChange={(value: string) =>
                        field.onChange(Number(value))
                      }
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of passengers" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem
                            key={num}
                            value={num.toString()}
                          >
                            {num} {num === 1 ? "Adult" : "Adults"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cabinClass"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Cabin Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cabin class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="premium_economy">
                          Premium Economy
                        </SelectItem>
                        <SelectItem value="business">
                          Business
                        </SelectItem>
                        <SelectItem value="first">First Class</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Flights"
              )}
            </Button>
          </form>
        </Form>
      </div>

      {isLoading && (
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200 rounded">
            <div className="h-2 bg-blue-500 rounded animate-pulse" style={{ width: '50%' }}></div>
          </div>
        </div>
      )}

      {data && data.offers && (
        <FlightResults
          offers={data.offers}
          onSelectOffer={handleSelectOffer}
        />
      )}
    </div>
  );
}

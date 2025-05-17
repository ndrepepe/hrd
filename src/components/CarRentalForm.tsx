"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  car_id: z.string({
    required_error: "Nama mobil wajib dipilih.",
  }),
  borrower_name: z.string().min(2, {
    message: "Nama peminjam harus minimal 2 karakter.",
  }),
  driver_name: z.string().optional(),
  rent_date: z.date({
    required_error: "Tanggal pinjam wajib diisi.",
  }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Format jam pinjam tidak valid (HH:MM).",
  }),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Format jam kembali tidak valid (HH:MM).",
  }),
});

interface Car {
  id: string;
  name: string;
}

interface CarRentalFormProps {
  refreshCarsTrigger: number; // Prop to trigger refresh of car list
  onRentalSubmitted: () => void; // New callback prop
}

const CarRentalForm = ({ refreshCarsTrigger, onRentalSubmitted }: CarRentalFormProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      car_id: "",
      borrower_name: "",
      driver_name: "",
      rent_date: undefined,
      start_time: "",
      end_time: "",
    },
  });

  useEffect(() => {
    fetchCars();
  }, [refreshCarsTrigger]); // Depend on refreshCarsTrigger

  const fetchCars = async () => {
    setLoadingCars(true);
    const { data, error } = await supabase
      .from("cars")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching cars:", error);
      showError("Gagal memuat daftar mobil: " + error.message);
    } else {
      setCars(data || []);
    }
    setLoadingCars(false);
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted with values:", values);
    const { data, error } = await supabase
      .from("rentals")
      .insert([
        {
          car_id: values.car_id, // Use car_id instead of car_name
          borrower_name: values.borrower_name,
          driver_name: values.driver_name,
          rent_date: format(values.rent_date, "yyyy-MM-dd"),
          start_time: values.start_time,
          end_time: values.end_time,
        },
      ])
      .select(); // Use select() to get the inserted data

    if (error) {
      console.error("Error inserting rental data:", error);
      showError("Gagal menyimpan data peminjaman: " + error.message);
    } else {
      console.log("Rental data inserted successfully:", data);
      showSuccess("Data peminjaman berhasil disimpan!");
      form.reset(); // Reset form after successful submission
      onRentalSubmitted(); // Call the callback here
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">Input Peminjaman Mobil</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Nama Mobil (Top) */}
          <FormField
            control={form.control}
            name="car_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Mobil</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nama mobil" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingCars ? (
                      <SelectItem disabled>Memuat mobil...</SelectItem>
                    ) : cars.length === 0 ? (
                       <SelectItem disabled>Belum ada mobil</SelectItem>
                    ) : (
                      cars.map((car) => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nama Peminjam (Left) and Nama Sopir (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="borrower_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Peminjam</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Budi Santoso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="driver_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Sopir (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Agus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tanggal Pinjam (Below names) */}
          <FormField
            control={form.control}
            name="rent_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Pinjam</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal", // Changed width to full
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Jam Pinjam (Left) and Jam Kembali (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Pinjam (HH:MM)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Kembali (HH:MM)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit">Simpan Peminjaman</Button>
        </form>
      </Form>
    </div>
  );
};

export default CarRentalForm;
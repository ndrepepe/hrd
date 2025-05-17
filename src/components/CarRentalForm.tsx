"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns"; // Import parseISO
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

interface Rental { // Define Rental interface here for form usage
  id: string;
  created_at: string;
  car_id: string | null;
  car_name: string | null;
  borrower_name: string;
  driver_name: string | null;
  rent_date: string;
  start_time: string;
  end_time: string;
  cars?: { name: string } | null;
}


interface CarRentalFormProps {
  refreshCarsTrigger: number;
  editingRental: Rental | null; // Prop to receive rental data for editing
  onRentalSubmitted: () => void; // Callback after insert/update
  onCancelEdit: () => void; // Callback to cancel editing
}

const CarRentalForm = ({ refreshCarsTrigger, editingRental, onRentalSubmitted, onCancelEdit }: CarRentalFormProps) => {
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

  // Effect to populate form when editingRental changes
  useEffect(() => {
    if (editingRental) {
      form.reset({
        car_id: editingRental.car_id || "", // Use car_id, fallback to "" if null
        borrower_name: editingRental.borrower_name,
        driver_name: editingRental.driver_name || "",
        rent_date: editingRental.rent_date ? parseISO(editingRental.rent_date) : undefined, // Parse date string
        start_time: editingRental.start_time,
        end_time: editingRental.end_time,
      });
    } else {
      form.reset({ // Reset form when not editing
        car_id: "",
        borrower_name: "",
        driver_name: "",
        rent_date: undefined,
        start_time: "",
        end_time: "",
      });
    }
  }, [editingRental, form]); // Depend on editingRental and form

  useEffect(() => {
    fetchCars();
  }, [refreshCarsTrigger]);

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

    const rentalData = {
      car_id: values.car_id,
      borrower_name: values.borrower_name,
      driver_name: values.driver_name || null, // Ensure optional fields are null if empty
      rent_date: format(values.rent_date, "yyyy-MM-dd"),
      start_time: values.start_time,
      end_time: values.end_time,
    };

    let error = null;
    let data = null;

    if (editingRental) {
      // Update existing rental
      const result = await supabase
        .from("rentals")
        .update(rentalData)
        .eq("id", editingRental.id)
        .select();
      data = result.data;
      error = result.error;
      console.log("Update result:", result);
    } else {
      // Insert new rental
      const result = await supabase
        .from("rentals")
        .insert([rentalData])
        .select();
      data = result.data;
      error = result.error;
      console.log("Insert result:", result);
    }


    if (error) {
      console.error(`Error ${editingRental ? 'updating' : 'inserting'} rental data:`, error);
      showError(`Gagal menyimpan data peminjaman: ${error.message}`);
    } else {
      console.log(`Rental data ${editingRental ? 'updated' : 'inserted'} successfully:`, data);
      showSuccess(`Data peminjaman berhasil disimpan!`);
      form.reset(); // Reset form after successful submission
      onRentalSubmitted(); // Notify parent to refresh list and potentially clear editing state
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-xl font-semibold mb-4">{editingRental ? "Edit Data Peminjaman" : "Input Peminjaman Mobil"}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="car_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Mobil</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}> {/* Use value prop */}
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nama mobil" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingCars ? (
                      <SelectItem disabled value="loading">Memuat mobil...</SelectItem> {/* Add dummy value */}
                    ) : cars.length === 0 ? (
                       <SelectItem disabled value="empty">Belum ada mobil</SelectItem> {/* Add dummy value */}
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
          <div className="flex space-x-2"> {/* Button container */}
            <Button type="submit">{editingRental ? "Update Peminjaman" : "Simpan Peminjaman"}</Button>
            {editingRental && ( // Show cancel button only when editing
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                Batal Edit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CarRentalForm;
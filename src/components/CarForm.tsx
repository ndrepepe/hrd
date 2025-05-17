"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama mobil harus minimal 2 karakter.",
  }),
});

interface AddCarFormProps {
  onCarAdded: () => void; // Callback to notify parent when a car is added
}

const AddCarForm = ({ onCarAdded }: AddCarFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting new car:", values);
    const { data, error } = await supabase
      .from("cars")
      .insert([
        {
          name: values.name,
        },
      ])
      .select(); // Use select() to get the inserted data

    if (error) {
      console.error("Error inserting car:", error);
      showError("Gagal menyimpan mobil: " + error.message);
    } else {
      console.log("Car inserted successfully:", data);
      showSuccess("Mobil berhasil disimpan!");
      form.reset(); // Reset form after successful submission
      onCarAdded(); // Notify parent (CarRentalPage) to refresh the list
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Tambah Nama Mobil</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Mobil</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Toyota Avanza" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Simpan Mobil</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddCarForm;
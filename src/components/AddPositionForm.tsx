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
  title: z.string().min(2, {
    message: "Nama posisi harus minimal 2 karakter.",
  }),
});

interface AddPositionFormProps {
  onPositionAdded: () => void; // Callback to notify parent
}

const AddPositionForm = ({ onPositionAdded }: AddPositionFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting new position:", values);
    const { data, error } = await supabase
      .from("positions")
      .insert([
        {
          title: values.title,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting position:", error);
      showError("Gagal menyimpan posisi: " + error.message);
    } else {
      console.log("Position inserted successfully:", data);
      showSuccess("Posisi berhasil disimpan!");
      form.reset();
      onPositionAdded(); // Call callback
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Tambah Posisi Baru</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Posisi</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Simpan Posisi</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddPositionForm;
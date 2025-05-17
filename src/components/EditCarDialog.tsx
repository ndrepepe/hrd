"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface Car {
  id: string;
  created_at: string;
  name: string;
}

interface EditCarDialogProps {
  car: Car | null; // The car data to edit, or null if dialog is closed
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback to close the dialog
  onCarUpdated: () => void; // Callback to notify parent after update
}

const EditCarDialog = ({ car, isOpen, onClose, onCarUpdated }: EditCarDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Effect to populate the form when the 'car' prop changes (i.e., when dialog opens with a car)
  useEffect(() => {
    if (car) {
      form.reset({ name: car.name });
    } else {
      // Reset form when dialog is closed or car is null
      form.reset({ name: "" });
    }
  }, [car, form]); // Depend on 'car' and 'form'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!car) return; // Should not happen if dialog is open, but safety check

    console.log("Submitting edit car form:", values, "Car ID:", car.id);

    const { data, error } = await supabase
      .from("cars")
      .update({ name: values.name })
      .eq("id", car.id)
      .select();

    if (error) {
      console.error("Error updating car:", error);
      showError("Gagal memperbarui mobil: " + error.message);
    } else {
      console.log("Car updated successfully:", data);
      showSuccess("Nama mobil berhasil diperbarui!");
      onCarUpdated(); // Notify parent to refresh the list
      onClose(); // Close the dialog
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Nama Mobil</DialogTitle>
          <DialogDescription>
            Ubah nama mobil di sini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCarDialog;
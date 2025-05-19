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

// Define the schema for the form fields
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Nama posisi harus minimal 2 karakter.",
  }),
});

// Define the type for the data passed to the dialog
interface PositionData {
  id: string;
  title: string;
}

interface EditPositionDialogProps {
  position: PositionData | null; // The position data to edit, or null if dialog is closed
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback to close the dialog
  onPositionUpdated: () => void; // Callback to notify parent after update
}

const EditPositionDialog = ({ position, isOpen, onClose, onPositionUpdated }: EditPositionDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  // Effect to populate the form when the 'position' prop changes (i.e., when dialog opens with data)
  useEffect(() => {
    if (position) {
      form.reset({ title: position.title });
    } else {
      // Reset form when dialog is closed or position is null
      form.reset({ title: "" });
    }
  }, [position, form]); // Depend on 'position' and 'form'

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!position) return; // Should not happen if dialog is open, but safety check

    console.log("Submitting edit position form:", values, "Position ID:", position.id);

    const { data, error } = await supabase
      .from("positions")
      .update({ title: values.title })
      .eq("id", position.id)
      .select() // Select the updated row
      .single(); // Expecting a single row update

    if (error) {
      console.error("Error updating position:", error);
      showError("Gagal memperbarui posisi: " + error.message);
    } else if (data) {
      console.log("Position updated successfully:", data);
      showSuccess("Nama posisi berhasil diperbarui!");
      onPositionUpdated(); // Notify parent to refresh the list
      onClose(); // Close the dialog
    } else {
       console.warn(`Update successful for ID ${position.id}, but no data returned.`);
       showSuccess("Nama posisi berhasil diperbarui!"); // Still show success even if no data returned
       onPositionUpdated(); // Notify parent
       onClose(); // Close the dialog
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Nama Posisi</DialogTitle>
          <DialogDescription>
            Ubah nama posisi di sini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
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

export default EditPositionDialog;
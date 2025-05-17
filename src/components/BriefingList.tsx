"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns"; // Import parseISO
import { Input } from "@/components/ui/input"; // Import Input for inline editing
import { CalendarIcon, Loader2 } from "lucide-react"; // Import Loader2 icon
import { Calendar } from "@/components/ui/calendar"; // Import Calendar for date editing
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover
import { cn } from "@/lib/utils"; // Import cn for class names

interface DecisionWithCandidate {
  id: string;
  created_at: string;
  candidate_id: string;
  status: string;
  start_date: string | null;
  rejection_reason: string | null;
  end_date: string | null; // Add new field
  briefing_result: string | null; // Add new field
  candidates?: { // Joined candidate data
    id: string;
    name: string;
    // Removed place_of_birth and date_of_birth from here
    phone: string | null;
    address_ktp: string | null;
    last_education: string | null;
    major: string | null;
    skills: string | null;
  } | null;
}

interface BriefingListProps {
  refreshTrigger: number; // Prop to trigger refresh
}

const BriefingList = ({ refreshTrigger }: BriefingListProps) => {
  const [acceptedCandidates, setAcceptedCandidates] = useState<DecisionWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'end_date' | 'briefing_result' } | null>(null);
  const [inlineInputValue, setInlineInputValue] = useState<string | Date | undefined>(undefined);
  const [savingId, setSavingId] = useState<string | null>(null); // State to track saving status

  useEffect(() => {
    fetchAcceptedCandidates();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const fetchAcceptedCandidates = async () => {
    setLoading(true);
    console.log("Fetching accepted candidates for briefing list...");

    // Fetch decisions with status 'Accepted' and join with candidates table
    const { data, error } = await supabase
      .from("decisions")
      .select(`
        id,
        created_at,
        candidate_id,
        status,
        start_date,
        rejection_reason,
        end_date,         // Select new field
        briefing_result,  // Select new field
        candidates (
          id,
          name,
          phone,
          address_ktp,
          last_education,
          major,
          skills
        )
      `)
      .eq("status", "Accepted") // Filter by Accepted status
      .order("created_at", { ascending: false }); // Order by decision creation date

    // --- START: Added Logging ---
    console.log("Supabase fetch result for accepted candidates:");
    console.log("Data:", data);
    console.log("Error:", error);
    // --- END: Added Logging ---


    if (error) {
      console.error("Error fetching accepted candidates:", error);
      showError("Gagal memuat data kandidat diterima: " + error.message);
      setAcceptedCandidates([]); // Clear data on error
    } else {
      console.log("Fetched accepted candidates data:", data);
      // Filter out any entries where candidate data might be null (shouldn't happen with foreign key)
      const validData = data?.filter(item => item.candidates !== null) as DecisionWithCandidate[] || [];
      console.log("Filtered valid data:", validData); // <-- Add console log here
      setAcceptedCandidates(validData);
    }
    setLoading(false);
  };

  const handleCellClick = (id: string, field: 'end_date' | 'briefing_result', currentValue: string | null) => {
    if (savingId === id) return; // Prevent editing while saving
    setEditingCell({ id, field });
    if (field === 'end_date') {
        // For date, set the initial value as a Date object if it exists
        setInlineInputValue(currentValue ? parseISO(currentValue) : undefined);
    } else {
        // For text, set the initial value as a string
        setInlineInputValue(currentValue || '');
    }
  };

  const handleSave = async (id: string, field: 'end_date' | 'briefing_result', value: string | Date | undefined) => {
    setSavingId(id); // Set saving state for this row

    let updateValue: string | null = null;
    if (field === 'end_date') {
        // Format Date object to 'yyyy-MM-dd' string, or null if undefined
        updateValue = value instanceof Date && !isNaN(value.getTime()) ? format(value, "yyyy-MM-dd") : null;
    } else {
        // Use string value, or null if empty string
        updateValue = typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
    }

    console.log(`Saving ${field} for ID ${id} with value:`, updateValue);

    const { data, error } = await supabase
      .from("decisions")
      .update({ [field]: updateValue })
      .eq("id", id)
      .select() // Select the updated row to refresh local state
      .single(); // Expecting a single row update

    if (error) {
      console.error(`Error updating ${field} for ID ${id}:`, error);
      showError(`Gagal memperbarui ${field === 'end_date' ? 'Tanggal Berakhir' : 'Hasil Pembekalan'}: ` + error.message);
    } else if (data) {
      console.log(`${field} updated successfully for ID ${id}:`, data);
      showSuccess(`${field === 'end_date' ? 'Tanggal Berakhir' : 'Hasil Pembekalan'} berhasil diperbarui!`);

      // Update the local state with the fetched updated data
      setAcceptedCandidates(prevCandidates =>
        prevCandidates.map(candidate =>
          candidate.id === id ? { ...candidate, [field]: data[field] } : candidate
        )
      );
    } else {
       console.warn(`Update successful for ID ${id}, but no data returned.`);
       // Optionally refresh the whole list if select().single() didn't return data
       // fetchAcceptedCandidates();
    }

    setEditingCell(null); // Exit editing mode
    setInlineInputValue(undefined); // Clear input value
    setSavingId(null); // Clear saving state
  };

  const handleInputBlur = (id: string, field: 'briefing_result') => {
    // Only save if the value has potentially changed and it's not a date field (date is handled by onSelect)
    if (editingCell?.id === id && editingCell?.field === field) {
        handleSave(id, field, inlineInputValue);
    }
  };

  const handleDateSelect = (id: string, date: Date | undefined) => {
     // Save the date immediately when selected
     handleSave(id, 'end_date', date);
  };


  if (loading) {
    return <div className="container mx-auto p-4">Memuat daftar kandidat diterima...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Daftar Kandidat Diterima (Pembekalan)</h3>
      {acceptedCandidates.length === 0 ? (
        <p>Belum ada kandidat dengan status 'Diterima'.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                {/* Removed Tempat/Tgl Lahir */}
                <TableHead>No HP</TableHead>
                <TableHead>Pendidikan</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Tanggal Berakhir</TableHead> {/* New Header */}
                <TableHead>Hasil Pembekalan</TableHead> {/* New Header */}
                <TableHead>Keputusan Dibuat Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acceptedCandidates.map((decision) => (
                <TableRow key={decision.id}> {/* Use decision ID as key */}
                  <TableCell>{decision.candidates?.name || "-"}</TableCell>
                  <TableCell>{decision.start_date ? format(new Date(decision.start_date), "dd-MM-yyyy") : "-"}</TableCell>
                   {/* Removed Tempat/Tgl Lahir Cell */}
                    <TableCell>{decision.candidates?.phone || "-"}</TableCell>
                    <TableCell>{decision.candidates?.last_education || "-"}</TableCell>
                    <TableCell>{decision.candidates?.skills || "-"}</TableCell>

                    {/* Tanggal Berakhir Cell (Inline Edit) */}
                    <TableCell
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(decision.id, 'end_date', decision.end_date)}
                    >
                        {editingCell?.id === decision.id && editingCell?.field === 'end_date' ? (
                            <Popover open={true} onOpenChange={(open) => !open && setEditingCell(null)}> {/* Keep open while editing */}
                                <PopoverTrigger asChild>
                                    {/* Render a button or input to anchor the popover */}
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !inlineInputValue && "text-muted-foreground"
                                        )}
                                    >
                                        {inlineInputValue instanceof Date && !isNaN(inlineInputValue.getTime()) ? (
                                            format(inlineInputValue, "PPP")
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={inlineInputValue instanceof Date ? inlineInputValue : undefined}
                                        onSelect={(date) => handleDateSelect(decision.id, date)} // Save on select
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        ) : (
                            savingId === decision.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" /> // Show loader while saving
                            ) : (
                                decision.end_date ? format(new Date(decision.end_date), "dd-MM-yyyy") : "-"
                            )
                        )}
                    </TableCell>

                    {/* Hasil Pembekalan Cell (Inline Edit) */}
                    <TableCell
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(decision.id, 'briefing_result', decision.briefing_result)}
                    >
                        {editingCell?.id === decision.id && editingCell?.field === 'briefing_result' ? (
                            <Input
                                value={inlineInputValue as string}
                                onChange={(e) => setInlineInputValue(e.target.value)}
                                onBlur={() => handleInputBlur(decision.id, 'briefing_result')} // Save on blur
                                autoFocus // Focus the input when it appears
                                disabled={savingId === decision.id} // Disable while saving
                            />
                        ) : (
                            savingId === decision.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" /> // Show loader while saving
                            ) : (
                                decision.briefing_result || "-"
                            )
                        )}
                    </TableCell>

                  <TableCell>{new Date(decision.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default BriefingList;
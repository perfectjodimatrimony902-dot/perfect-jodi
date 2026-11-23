import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/FormField";
import { NativeSelect } from "@/components/common/NativeSelect";
import {
  AGES,
  CITIES,
  COMMUNITIES,
  HEIGHTS,
  MARITAL_STATUSES,
  MOTHER_TONGUES,
  OCCUPATIONS,
  QUALIFICATIONS,
  RELIGIONS,
} from "@/lib/options";
import { shortHeight, type ProfileFilters } from "@/lib/matching";

type Key = keyof ProfileFilters;

export function ProfileFiltersPanel({
  value,
  onChange,
  onClear,
  activeCount,
}: {
  value: ProfileFilters;
  onChange: (key: Key, v: string) => void;
  onClear: () => void;
  activeCount: number;
}) {
  const ages = AGES.map((a) => ({ value: String(a), label: `${a} yrs` }));
  const heights = HEIGHTS.map((h) => ({ value: String(h), label: shortHeight(h) }));
  const sel = (
    key: Key,
    label: string,
    options: (string | { value: string; label: string })[],
    placeholder = "Any",
  ) => (
    <FormField id={`f-${key}`} label={label}>
      <NativeSelect
        id={`f-${key}`}
        value={value[key] !== undefined ? String(value[key]) : ""}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={placeholder}
        options={options}
      />
    </FormField>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Refine search</h2>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={activeCount === 0}>
          <RotateCcw className="h-3.5 w-3.5" /> Clear{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>
      {sel(
        "lookingFor",
        "Looking for",
        [
          { value: "bride", label: "Bride" },
          { value: "groom", label: "Groom" },
        ],
        "Brides & grooms",
      )}
      <div className="grid grid-cols-2 gap-3">
        {sel("ageMin", "Age from", ages)}
        {sel("ageMax", "Age to", ages)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {sel("heightMin", "Height from", heights)}
        {sel("heightMax", "Height to", heights)}
      </div>
      {sel("religion", "Religion", RELIGIONS)}
      {sel("community", "Community", COMMUNITIES)}
      {sel("motherTongue", "Mother tongue", MOTHER_TONGUES)}
      {sel("location", "Location", CITIES)}
      {sel("education", "Education", QUALIFICATIONS)}
      {sel("occupation", "Occupation", OCCUPATIONS)}
      {sel("maritalStatus", "Marital status", MARITAL_STATUSES)}
    </div>
  );
}

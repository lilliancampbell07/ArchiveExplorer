import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  size?: "default" | "large";
  disabled?: boolean;
}

const SearchBar = ({ onSearch, placeholder = "Ask a question about the archives...", size = "default", disabled = false }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full pl-10 ${size === "large" ? "h-14 text-lg" : "h-12"}`}
            disabled={disabled}
          />
        </div>
        <Button 
          type="submit" 
          size={size === "large" ? "lg" : "default"}
          className={size === "large" ? "h-14 px-8" : "h-12"}
          disabled={disabled}
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;

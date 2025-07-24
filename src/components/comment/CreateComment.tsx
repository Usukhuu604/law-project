"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateComment({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <div className="space-y-2 mt-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Сэтгэгдэл бичих..."
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSend}>
          Сэтгэгдэл үлдээх
        </Button>
      </div>
    </div>
  );
}


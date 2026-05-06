import Image from "next/image";
import {TextInputField} from "@/components/form-field/text-input";

export default function Home() {
  return (
    <div>
      <TextInputField
          label="Name"
          name="name"
          type="text"
          required
          helperText="Please enter your name"
          className="w-full"
          placeholder="Enter your name"
      />
    </div>
  );
}

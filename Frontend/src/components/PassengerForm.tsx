import { useEffect, useState } from "react";
import Input from "./ui/Input";

export type Passenger = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function PassengerForm({
  onChange,
}: {
  onChange: (data: Passenger) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    onChange({ firstName, lastName, email, phone });
  }, [firstName, lastName, email, phone]);

  return (
    <div className="rounded-xl border p-4 bg-white shadow space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
    </div>
  );
}

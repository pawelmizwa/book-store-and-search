import * as RadixSwitch from "@radix-ui/react-switch";

type Props = {
  id: string;
};

// This is an example of how to use 3rd party components.
// You should always wrap them in a custom component that you can control.
// This way, we can ensure our own styling and behavior.
// You can safely remove the @radix-ui/react-switch library if you don't need it.
export function Switch({ id }: Props) {
  return (
    <RadixSwitch.Root
      className="bg-blackA6 relative h-[25px] w-[42px] cursor-default rounded-full shadow-[0_0_3px] outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black"
      id={id}
    >
      <RadixSwitch.Thumb className="shadow-blackA4 block h-[21px] w-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
    </RadixSwitch.Root>
  );
}

import type { Meta, StoryObj } from "@storybook/react";
import BoardingPass from "../app/components/BoardingPass";

const meta: Meta<typeof BoardingPass> = {
  title: "Flight/BoardingPass",
  component: BoardingPass,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "night",
      values: [
        { name: "night", value: "#05070d" },
        { name: "slate", value: "#0f172a" },
      ],
    },
  },
  argTypes: {
    onTear: { action: "torn" },
  },
};

export default meta;

type Story = StoryObj<typeof BoardingPass>;

export const Default: Story = {
  args: {
    origin: "TPE",
    destination: "HND",
    durationSeconds: 25 * 60,
    onTear: () => {},
    debug: false,
  },
};

export const Debug: Story = {
  args: {
    origin: "SFO",
    destination: "LAX",
    durationSeconds: 15 * 60,
    onTear: () => {},
    debug: true,
  },
};

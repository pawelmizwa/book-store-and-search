import { Card } from "src/components/atoms/Card";
import { render, screen } from "@testing-library/react";

// This is just a sample test to make tests on CI work. You can remove it.
describe("Card", () => {
  it("renders properly", async () => {
    render(<Card title="tile">Content</Card>);

    expect(screen.getByText("tile")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});

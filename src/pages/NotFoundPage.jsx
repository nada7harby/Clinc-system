import { Link } from "react-router-dom";
import { Button, Card } from "@/components";

function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md text-center" title="Page Not Found">
        <p className="mb-6 text-sm text-slate-600">
          The page you are looking for does not exist in this starter template.
        </p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </Card>
    </div>
  );
}

export default NotFoundPage;

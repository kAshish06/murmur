import Button from "../components/atoms/Button";

type props = {
  onRegisterClick: () => void;
};
export default function HeroSection({ onRegisterClick }: props) {
  return (
    <section className="text-center py-10 px-4 sm:px-6 md:py-10">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
        Conversations. Reimagined.
      </h2>
      <p className="text-base sm:text-lg max-w-xl mx-auto mb-8 text-gray-700">
        Murmur is the modern way to chat — clean, private, and lightning fast.
      </p>
      <div className="my-3">
        <Button btnType="primary" onClick={() => onRegisterClick()}>
          Get Started
        </Button>
      </div>
    </section>
  );
}

const Footer = () => {
  return (
    <footer className="bg-base-200 text-center text-gray-600 py-6 mt-8">
      <div className="container mx-auto">
        &copy; {new Date().getFullYear()} Fashion Studio. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

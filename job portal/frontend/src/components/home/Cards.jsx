export default function Cards() {
  const infoItems = [
    {
      title: "Smart Profiles",
      description:
        "Craft a profile that stands out. Upload resumes, showcase skills, certifications & achievements. Get discovered by top recruiters.",
      color: "#AA88F380",
    },
    {
      title: "Precision Job Matchings",
      description:
        "Skip the endless scrolling. We connect you with jobs & internships that actually fit- not just fill.",
      color: "#C4F2BF",
    },
    {
      title: "Gamified Career Progression",
      description:
        "Earn rewards, complete milestones, and level up through resume boosts, skill tests & mini-career quests.",
      color: "#BED8F4",
    },
    {
      title: "Engaged Student Community",
      description:
        "All in one place. Filter by domain, duration, stipend, location or remote-only roles.",
      color: "#FF83A480",
    },
    {
      title: "Internships, Jobs & Live Projects",
      description:
        "Peer learning, webinars, collabs & discussion forums to grow together. Share, learn, repeat.",
      color: "#C1C1E9",
    },
    {
      title: "AI Career Insights",
      description:
        "Confused about your next move? Get AI-driven guidance tailored to your strengths, interests & career trends.",
      color: "#F8E7B9",
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 w-full rounded-full">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className="p-10 rounded-lg relative overflow-hidden w-full"
            style={{ backgroundColor: item.color }}  
          >
            <h3 className="text-lg font-bold mb-2 text-[#254D32]">
              {item.title}
            </h3>
            <p className="text-sm text-[#254D32]">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

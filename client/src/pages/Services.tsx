import ServiceCard from "../components/Cards/Service"

const services = [
    {
        "title": "Find Doctors by Specialization",
        "description": "Easily locate expert doctors based on their specialization and expertise in various fields of medicine.",
        "image": "/Services/Speciality.jpg",
        "link": "/services/specialties"
    },
    {
        "title": "Discover Top Hospitals Near You",
        "description": "Search for the best hospitals based on ratings, facilities, and services to get quality healthcare.",
        "image": "/Services/Hospital.jpg",
        "link": "/services/hospitals"

    },
    {
        "title": "Instant Appointment Booking",
        "description": "Book appointments with the best doctors in just a few clicks, without waiting in long queues.",
        "image": "/Services/Appointment.jpg",
        "link": "/services/appointments"
    },
    {
        "title": "Emergency Care Assistance",
        "description": "Get quick access to emergency healthcare, nearby trauma centers in critical situations.",
        "image": "/Services/Emergency.jpg",
        "link": "/services/emergency"
    }
]


const Services = () => {
    return (
        <div className="py-12">
            <div style={{ fontFamily: "RaleWay" }} className="text-3xl md:text-5xl font-bold text-center text-[#00ADB5]">Services</div>
            <div className="grid grid-cols-2 justify-items-center rounded-lg px-4 md:grid-cols-4 gap-4 md:gap-8 py-8">
                {services.map((service, index) => {
                    return <ServiceCard key={index} link={service.link} title={service.title} description={service.description} image={service.image} />
                })}
            </div>
        </div>
    )
}

export default Services
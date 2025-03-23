import ServiceCard from "../components/Cards/Service"

const services = [
    {
        "title": "Sign Up as a User / Patient",
        "description": "Create an account as a patient to book appointments, get prescriptions, and access healthcare services.",
        "image": "/Auth/Person.jpeg",
        "link": "/auth/user"
    },
    {
        "title": "Sign Up as a Doctor / Hospital",
        "description": "Register as a doctor or hospital to provide healthcare services, manage appointments, and interact with patients.",
        "image": "/Auth/Doctor.png",
        "link": "/auth/hospital"

    },
]


const Auth = () => {
    return (
        <div className="py-12">
            <div style={{ fontFamily: "RaleWay" }} className="text-5xl font-bold text-center text-[#00ADB5]">Login / Register</div>
            <div className="flex p-8 md:p-12 gap-4 justify-center">
                {services.map((service, index) => {
                    return <ServiceCard key={index} link={service.link} title={service.title} description={service.description} image={service.image} />
                })}
            </div>
        </div>
    )
}

export default Auth;
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { CheckCircle, Users, Lightbulb, Target } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16 md:py-24">
        <div className="container max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            About PAIE Cell
          </h1>
          <p className="text-lg text-muted-foreground">
            Empowering students through People Association for Inner Engineering Cell
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl space-y-12">
          {/* Overview */}
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Who We Are</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              PAIE Cell stands for People Association for Inner Engineering Cell. We are a dedicated team committed to fostering holistic development of students at SRKR Engineering College. Our mission is to bridge the gap between academic learning and industry requirements while nurturing entrepreneurial spirit and innovation among our students.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe that true education extends beyond textbooks. It encompasses practical skills, industry exposure, and the courage to innovate and create. Through our comprehensive programs and initiatives, we aim to transform students into industry-ready professionals and future entrepreneurs.
            </p>
          </div>

          {/* Core Values */}
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex gap-4">
                  <Target className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Excellence</h3>
                    <p className="text-muted-foreground">We strive for excellence in every initiative, ensuring quality outcomes and meaningful impact on student development.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-4">
                  <Users className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Collaboration</h3>
                    <p className="text-muted-foreground">We believe in the power of teamwork and collaboration with industry partners, faculty, and students.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-4">
                  <Lightbulb className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Innovation</h3>
                    <p className="text-muted-foreground">We encourage creative thinking and innovative solutions to real-world problems.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-4">
                  <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Integrity</h3>
                    <p className="text-muted-foreground">We maintain the highest standards of integrity and transparency in all our operations.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Journey & Milestones */}
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Our Journey</h2>
            <div className="space-y-8">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent md:transform md:-translate-x-1/2"></div>

                {/* Timeline items */}
                <div className="space-y-8">
                  {/* 2018 */}
                  <div className="md:flex md:gap-8">
                    <div className="md:w-1/2 md:text-right md:pr-8">
                      <div className="ml-12 md:ml-0">
                        <h3 className="font-display text-xl font-bold text-foreground">2018</h3>
                        <p className="text-muted-foreground mt-2">Foundation & Vision</p>
                      </div>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background md:transform md:-translate-x-1/2 md:-translate-y-1/2 mt-1"></div>
                    <div className="md:w-1/2 md:pl-8">
                      <Card className="p-4 mt-2 md:mt-0">
                        <p className="text-muted-foreground">PAIE Cell was established with a vision to create a comprehensive ecosystem for student development. We started with a small team of dedicated faculty and student leaders.</p>
                      </Card>
                    </div>
                  </div>

                  {/* 2019 */}
                  <div className="md:flex md:gap-8">
                    <div className="md:w-1/2 md:text-right md:pr-8">
                      <div className="ml-12 md:ml-0">
                        <h3 className="font-display text-xl font-bold text-foreground">2019</h3>
                        <p className="text-muted-foreground mt-2">Expansion & Growth</p>
                      </div>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background md:transform md:-translate-x-1/2 md:-translate-y-1/2 mt-1"></div>
                    <div className="md:w-1/2 md:pl-8">
                      <Card className="p-4 mt-2 md:mt-0">
                        <p className="text-muted-foreground">We expanded our initiatives to include industry partnerships, skill development workshops, and entrepreneurship programs. Our first cohort of students successfully secured placements in top companies.</p>
                      </Card>
                    </div>
                  </div>

                  {/* 2020 */}
                  <div className="md:flex md:gap-8">
                    <div className="md:w-1/2 md:text-right md:pr-8">
                      <div className="ml-12 md:ml-0">
                        <h3 className="font-display text-xl font-bold text-foreground">2020</h3>
                        <p className="text-muted-foreground mt-2">Digital Transformation</p>
                      </div>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background md:transform md:-translate-x-1/2 md:-translate-y-1/2 mt-1"></div>
                    <div className="md:w-1/2 md:pl-8">
                      <Card className="p-4 mt-2 md:mt-0">
                        <p className="text-muted-foreground">Adapting to the pandemic, we transitioned to online platforms. We launched virtual workshops, webinars, and mentorship programs, reaching a wider audience and maintaining engagement with students.</p>
                      </Card>
                    </div>
                  </div>

                  {/* 2021 */}
                  <div className="md:flex md:gap-8">
                    <div className="md:w-1/2 md:text-right md:pr-8">
                      <div className="ml-12 md:ml-0">
                        <h3 className="font-display text-xl font-bold text-foreground">2021</h3>
                        <p className="text-muted-foreground mt-2">Innovation Hub Launch</p>
                      </div>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background md:transform md:-translate-x-1/2 md:-translate-y-1/2 mt-1"></div>
                    <div className="md:w-1/2 md:pl-8">
                      <Card className="p-4 mt-2 md:mt-0">
                        <p className="text-muted-foreground">We established an innovation hub to support student startups and entrepreneurial ventures. Multiple student projects received funding and mentorship from industry experts.</p>
                      </Card>
                    </div>
                  </div>

                  {/* 2022 */}
                  <div className="md:flex md:gap-8">
                    <div className="md:w-1/2 md:text-right md:pr-8">
                      <div className="ml-12 md:ml-0">
                        <h3 className="font-display text-xl font-bold text-foreground">2022</h3>
                        <p className="text-muted-foreground mt-2">Industry Recognition</p>
                      </div>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background md:transform md:-translate-x-1/2 md:-translate-y-1/2 mt-1"></div>
                    <div className="md:w-1/2 md:pl-8">
                      <Card className="p-4 mt-2 md:mt-0">
                        <p className="text-muted-foreground">PAIE Cell gained recognition from leading companies and industry bodies. We established partnerships with Fortune 500 companies and launched specialized training programs.</p>
                      </Card>
                    </div>
                  </div>

                  {/* 2023-2024 */}
                  <div className="md:flex md:gap-8">
                    <div className="md:w-1/2 md:text-right md:pr-8">
                      <div className="ml-12 md:ml-0">
                        <h3 className="font-display text-xl font-bold text-foreground">2023-2024</h3>
                        <p className="text-muted-foreground mt-2">Digital Platform & Scale</p>
                      </div>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-8 h-8 bg-accent rounded-full border-4 border-background md:transform md:-translate-x-1/2 md:-translate-y-1/2 mt-1"></div>
                    <div className="md:w-1/2 md:pl-8">
                      <Card className="p-4 mt-2 md:mt-0">
                        <p className="text-muted-foreground">We launched this comprehensive digital platform to streamline event management, course registrations, and student engagement. We continue to scale our impact and reach more students globally.</p>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Achievements */}
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Key Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Students Placed in Top Companies</p>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold text-accent mb-2">50+</div>
                <p className="text-muted-foreground">Industry Partnerships</p>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold text-yellow-500 mb-2">100+</div>
                <p className="text-muted-foreground">Workshops & Seminars Conducted</p>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold text-green-500 mb-2">25+</div>
                <p className="text-muted-foreground">Student Startups Supported</p>
              </Card>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-primary/5">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To empower students with industry-relevant skills, entrepreneurial mindset, and academic excellence, enabling them to become successful professionals and innovators who contribute positively to society.
              </p>
            </Card>
            <Card className="p-8 bg-accent/5">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be a leading catalyst for student development, recognized for creating a vibrant ecosystem where innovation thrives, careers flourish, and entrepreneurial dreams become reality.
              </p>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">Join Our Community</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Be part of a thriving community of innovators, entrepreneurs, and industry professionals. Explore our events, courses, and opportunities to grow and succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/events" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Explore Events
              </a>
              <a href="/courses" className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors">
                Browse Courses
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface AppointmentConfirmationEmailProps {
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType?: string;
  duration?: number;
  price?: number;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const AppointmentConfirmationEmail = ({
  doctorName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  duration,
  price,
}: AppointmentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your appointment with {doctorName} is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={box}>
          <Text style={heading}>Appointment Confirmed!</Text>
          <Text style={paragraph}>
            Your dental appointment has been successfully booked.
          </Text>
        </Section>

        {/* Appointment Details */}
        <Section style={box}>
          <Text style={sectionHeading}>Appointment Details</Text>
          <Row style={detailRow}>
            <Text style={label}>Doctor:</Text>
            <Text style={value}>{doctorName}</Text>
          </Row>
          <Row style={detailRow}>
            <Text style={label}>Date:</Text>
            <Text style={value}>{appointmentDate}</Text>
          </Row>
          <Row style={detailRow}>
            <Text style={label}>Time:</Text>
            <Text style={value}>{appointmentTime}</Text>
          </Row>
          {appointmentType && (
            <Row style={detailRow}>
              <Text style={label}>Type:</Text>
              <Text style={value}>{appointmentType}</Text>
            </Row>
          )}
          {duration && (
            <Row style={detailRow}>
              <Text style={label}>Duration:</Text>
              <Text style={value}>{duration} minutes</Text>
            </Row>
          )}
          {price && (
            <Row style={detailRow}>
              <Text style={label}>Price:</Text>
              <Text style={value}>${price}</Text>
            </Row>
          )}
        </Section>

        {/* Important Info */}
        <Section style={box}>
          <Text style={sectionHeading}>Important Information</Text>
          <ul style={list}>
            <li>Please arrive 15 minutes early for your appointment</li>
            <li>Bring a valid ID and insurance card (if applicable)</li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
          </ul>
        </Section>

        {/* Call to Action */}
        <Section style={buttonContainer}>
          <Link style={button} href={`${baseUrl}/appointments`}>
            View My Appointments
          </Link>
        </Section>

        <Hr style={hr} />

        {/* Footer */}
        <Section>
          <Text style={footer}>
            © {new Date().getFullYear()} DentWise. All rights reserved.
          </Text>
          <Text style={footer}>
            This is an automated email. Please don't reply to this message.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default AppointmentConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 24px",
};

const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  margin: "16px 0 8px 0",
  color: "#1f2937",
};

const sectionHeading = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "24px 0 12px 0",
  color: "#1f2937",
};

const paragraph = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: "1.5",
  textAlign: "left" as const,
  margin: "0 0 12px 0",
};

const detailRow = {
  display: "flex" as const,
  justifyContent: "space-between" as const,
  padding: "8px 0",
  borderBottom: "1px solid #e5e7eb",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#6b7280",
  margin: "0",
  width: "120px",
};

const value = {
  fontSize: "14px",
  color: "#1f2937",
  margin: "0",
  flex: "1",
  textAlign: "right" as const,
};

const list = {
  paddingLeft: "20px",
  color: "#525252",
  fontSize: "14px",
  lineHeight: "1.8",
};

const buttonContainer = {
  textAlign: "center" as const,
  padding: "24px",
};

const button = {
  backgroundColor: "#0ea5e9",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  width: "200px",
  margin: "0 auto",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footer = {
  color: "#8b8b8b",
  fontSize: "12px",
  lineHeight: "1.5",
  textAlign: "center" as const,
  margin: "0",
};

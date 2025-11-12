import styled from 'styled-components';

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

export const Icon = styled.span.attrs({ className: 'material-icons' })`
  font-size: 20px;
  line-height: 1;
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  user-select: none;
`;

export const Header = styled.header`
  height: 60px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #30363d;
  }

  @media (max-width: 768px) {
    span:last-child {
      display: none;
    }
  }
`;

export const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #58a6ff;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: #c9d1d9;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #30363d;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

export const Sidebar = styled.aside`
  width: 250px;
  background: #161b22;
  border-right: 1px solid #30363d;
  padding: 24px 0;
  overflow-y: auto;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    z-index: 99;
    transform: ${props => props.open ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.3s ease;
    box-shadow: ${props => props.open ? '2px 0 8px rgba(0, 0, 0, 0.3)' : 'none'};
  }
`;

export const SidebarTitle = styled.h2`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #8b949e;
  margin: 0 0 16px 0;
  padding: 0 24px;
`;

export const NavList = styled.nav`
  display: flex;
  flex-direction: column;
`;

export const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  background: ${props => props.active ? '#30363d' : 'transparent'};
  border: none;
  border-left: 3px solid ${props => props.active ? '#58a6ff' : 'transparent'};
  color: ${props => props.active ? '#58a6ff' : '#8b949e'};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: #30363d;
    color: #c9d1d9;
  }

  ${Icon} {
    color: ${props => props.active ? '#58a6ff' : '#8b949e'};
  }
`;

export const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 48px;

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 6px;
  }

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

export const Section = styled.section`
  max-width: 900px;
  margin: 0 auto 80px auto;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: #c9d1d9;
  margin: 0 0 16px 0;

  ${Icon} {
    font-size: 32px;
    color: #58a6ff;
  }

  @media (max-width: 768px) {
    font-size: 24px;

    ${Icon} {
      font-size: 24px;
    }
  }
`;

export const Description = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #8b949e;
  margin: 0 0 32px 0;
`;

export const Card = styled.div`
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.2s;

  &:hover {
    border-color: #58a6ff;
  }
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #58a6ff;
  margin: 0 0 8px 0;
  font-family: 'Courier New', monospace;
`;

export const CardDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #8b949e;
  margin: 0 0 16px 0;
`;

export const CodeBlock = styled.pre`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
  color: #c9d1d9;
  font-family: 'Courier New', monospace;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }
`;

export const ParamsTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #c9d1d9;
  margin: 16px 0 8px 0;
`;

export const ParamsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ParamItem = styled.li`
  font-size: 14px;
  line-height: 1.8;
  color: #8b949e;
  padding-left: 20px;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 4px;
    color: #58a6ff;
    font-weight: bold;
  }
`;

export const ParamName = styled.code`
  color: #79c0ff;
  background: #1c2128;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
`;

export const Note = styled.div`
  background: #1c2128;
  border-left: 3px solid #58a6ff;
  padding: 12px 16px;
  margin: 16px 0;
  font-size: 13px;
  color: #8b949e;
  border-radius: 4px;
`;

export const SubSection = styled.div`
  margin: 48px 0;
`;

export const SubTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #c9d1d9;
  margin: 0 0 16px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: #30363d;
  margin: 80px auto;
  max-width: 900px;
`;

export const Footer = styled.footer`
  max-width: 900px;
  margin: 80px auto 0;
  padding: 32px 0;
  border-top: 1px solid #30363d;
`;

export const FooterText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #8b949e;
  text-align: center;
  margin: 0;
`;

export const FooterLink = styled.a`
  color: #58a6ff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #79c0ff;
    text-decoration: underline;
  }
`;
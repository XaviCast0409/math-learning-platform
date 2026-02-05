import 'katex/dist/katex.min.css'; // Importante para los estilos matemáticos
import Latex from 'react-latex-next';

interface Props {
  content: string;
}

const MathRenderer = ({ content }: Props) => {
  return (
    <span className="math-content text-lg leading-relaxed">
      <Latex>{content}</Latex>
    </span>
  );
};

export default MathRenderer;
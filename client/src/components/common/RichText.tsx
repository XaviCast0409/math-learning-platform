import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Importamos los estilos de KaTeX

interface RichTextProps {
  content: string;
  className?: string;
}

export const RichText = ({ content, className }: RichTextProps) => {
  return (
    <div className={`prose prose-slate max-w-none text-gray-800 ${className}`}>
      <ReactMarkdown
        // Plugins para entender matemáticas ($$)
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Personalizamos los estilos de los elementos Markdown para que coincidan con XaviUI
          h1: (props) => <h1 className="text-2xl font-black mb-3 mt-4" {...props} />,
          h2: (props) => <h2 className="text-xl font-bold mb-2 mt-3" {...props} />,
          h3: (props) => <h3 className="text-lg font-bold mb-2" {...props} />,
          p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: (props) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
          li: (props) => <li className="pl-1" {...props} />,
          strong: (props) => <strong className="font-black text-black" {...props} />,
          // Las fórmulas (code/pre) las maneja rehype-katex automáticamente
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
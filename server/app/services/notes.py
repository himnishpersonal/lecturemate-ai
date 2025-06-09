import os
from dotenv import load_dotenv
import re
import aiohttp
import json

load_dotenv()

class NotesService:
    def __init__(self):
        print("Initializing Ollama client...")
        self.api_url = "https://ollama.snagaquadart.com/api/generate"
        print("Ollama client initialized successfully")

    def _chunk_text(self, text: str, max_length: int = 100000) -> list[str]:
        """Split text into chunks that the model can process."""
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = []
        current_length = 0
        
        for paragraph in paragraphs:
            if len(paragraph) > max_length:
                # If a single paragraph is too long, split by sentences
                sentences = re.split('(?<=[.!?]) +', paragraph)
                for sentence in sentences:
                    if current_length + len(sentence) > max_length:
                        if current_chunk:
                            chunks.append('\n\n'.join(current_chunk))
                        current_chunk = [sentence]
                        current_length = len(sentence)
                    else:
                        current_chunk.append(sentence)
                        current_length += len(sentence)
            else:
                if current_length + len(paragraph) > max_length:
                    chunks.append('\n\n'.join(current_chunk))
                    current_chunk = [paragraph]
                    current_length = len(paragraph)
                else:
                    current_chunk.append(paragraph)
                    current_length += len(paragraph)
        
        if current_chunk:
            chunks.append('\n\n'.join(current_chunk))
        
        return chunks

    async def _generate_section(self, text: str, instruction: str) -> str:
        """Generate a specific section of notes using Ollama Gemma API"""
        prompt = f"""You are an AI assistant generating academic lecture notes.

INSTRUCTION: {instruction}

LECTURE TRANSCRIPT:
{text}

GUIDELINES:
- Do not respond with questions or comments.
- Do not ask for clarification.
- Write only the output as if it will appear in a final study guide.
- Be direct and objective.
- Be comprehensive yet concise
- Use clear academic language
- Highlight key theories and concepts
- Include relevant examples and applications
- Maintain logical flow and connections between ideas"""
        
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "gemma3:4b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.95,
                        "top_k": 40,
                        "num_ctx": 32768,
                        "max_tokens": 4000
                    }
                }
                
                async with session.post(self.api_url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"API request failed with status {response.status}: {error_text}")
                    
                    result = await response.json()
                    return result.get("response", "").strip()
                    
        except Exception as e:
            print(f"Ollama API error: {str(e)}")
            raise Exception(f"Error generating notes: {str(e)}")

    def _format_notes(self, sections: dict) -> str:
        """Format the various sections into structured HTML notes with proper styling"""
        notes = f"""
        <div class="lecture-notes">
            <h1 class="title">{sections['title']}</h1>
            
            <section class="overview">
                <h2>Overview</h2>
                <div class="content">
                    {self._format_paragraphs(sections['overview'])}
                </div>
            </section>
            
            <section class="key-concepts">
                <h2>Key Concepts</h2>
                <div class="content">
                    {self._format_bullet_points(sections['key_concepts'])}
                </div>
            </section>
            
            <section class="main-points">
                <h2>Main Points</h2>
                <div class="content">
                    {self._format_bullet_points(sections['main_points'])}
                </div>
            </section>
            
            {self._format_examples_section(sections.get('examples', ''))}
            
            <section class="summary">
                <h2>Summary & Key Takeaways</h2>
                <div class="content">
                    {self._format_paragraphs(sections['summary'])}
                </div>
            </section>
        </div>
        """
        return notes

    def _format_paragraphs(self, text: str) -> str:
        """Format text into paragraphs, preserving markdown-style formatting"""
        # Split by double newlines to separate paragraphs
        paragraphs = text.strip().split('\n\n')
        formatted = []
        
        for para in paragraphs:
            # Convert markdown-style bold
            para = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', para)
            # Convert markdown-style italic
            para = re.sub(r'\*(.*?)\*', r'<em>\1</em>', para)
            # Convert markdown-style headers
            para = re.sub(r'^##\s+(.*?)$', r'<h2>\1</h2>', para, flags=re.MULTILINE)
            para = re.sub(r'^###\s+(.*?)$', r'<h3>\1</h3>', para, flags=re.MULTILINE)
            
            if para.strip():
                formatted.append(f"<p>{para}</p>")
        
        return '\n'.join(formatted)

    def _format_bullet_points(self, text: str) -> str:
        """Format text into bullet points, preserving markdown-style formatting"""
        lines = text.strip().split('\n')
        formatted = []
        current_list = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Convert markdown-style bold
            line = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', line)
            # Convert markdown-style italic
            line = re.sub(r'\*(.*?)\*', r'<em>\1</em>', line)
            
            if line.startswith('- ') or line.startswith('* '):
                current_list.append(f"<li>{line[2:]}</li>")
            elif line.startswith('#'):
                if current_list:
                    formatted.append(f"<ul>{''.join(current_list)}</ul>")
                    current_list = []
                # Convert markdown headers
                line = re.sub(r'^##\s+(.*?)$', r'<h2>\1</h2>', line)
                line = re.sub(r'^###\s+(.*?)$', r'<h3>\1</h3>', line)
                formatted.append(line)
            else:
                if current_list:
                    formatted.append(f"<ul>{''.join(current_list)}</ul>")
                    current_list = []
                formatted.append(f"<p>{line}</p>")
        
        if current_list:
            formatted.append(f"<ul>{''.join(current_list)}</ul>")
            
        return '\n'.join(formatted)

    def _format_examples_section(self, examples: str) -> str:
        """Format the examples section if it exists"""
        if not examples or 'no examples' in examples.lower():
            return ''
            
        return f"""
        <section class="examples">
            <h2>Examples & Applications</h2>
            <div class="content">
                {self._format_bullet_points(examples)}
            </div>
        </section>
        """

    async def generate_notes(self, transcript: str, title: str = None) -> str:
        """Generate structured notes from a lecture transcript"""
        try:
            chunks = self._chunk_text(transcript)
            sections = {
                'title': title or "Lecture Notes",
                'overview': '',
                'key_concepts': '',
                'main_points': '',
                'examples': '',
                'summary': ''
            }
            
            # Process each chunk for different aspects
            for i, chunk in enumerate(chunks):
                if i == 0:  # First chunk gets overview and key concepts
                    sections['overview'] = await self._generate_section(
                        chunk,
                        "create a comprehensive overview that captures the main themes, objectives, and scope of the lecture"
                    )
                    sections['key_concepts'] = await self._generate_section(
                        chunk,
                        "identify and explain the key concepts, terms, definitions, and theoretical frameworks. Format as clear, complete statements"
                    )
                
                # Get main points from each chunk
                main_points = await self._generate_section(
                    chunk,
                    "extract and explain the main arguments, theories, methodologies, and important points discussed. Include any significant debates or controversies"
                )
                sections['main_points'] += main_points + " "
                
                # Look for examples
                examples = await self._generate_section(
                    chunk,
                    "identify and explain any examples, case studies, practical applications, or real-world connections mentioned"
                )
                if examples and 'no examples' not in examples.lower():
                    sections['examples'] += examples + " "
            
            # Generate final summary
            sections['summary'] = await self._generate_section(
                ' '.join(chunks[:2]),  # Use first two chunks for summary
                "create a comprehensive summary that synthesizes the key takeaways, main conclusions, and broader implications of the lecture content"
            )
            
            # Format everything into structured notes
            return self._format_notes(sections)
            
        except Exception as e:
            print(f"Error generating notes: {str(e)}")
            raise Exception(f"Error generating notes: {str(e)}")

notes_service = NotesService() 
from typing import Dict, List

class SubjectPrompts:
    MATHEMATICS = {
        "overview": """Create a comprehensive overview that:
- Identifies the core mathematical concepts and theorems
- Outlines the mathematical principles being discussed
- Highlights key formulas and their significance
- Explains the logical progression of ideas
- Connects concepts to broader mathematical theory""",
        
        "key_concepts": """Extract and explain:
- Mathematical definitions and theorems
- Essential formulas and equations
- Proof techniques and strategies
- Mathematical properties and relationships
- Abstract concepts and their interpretations
Format using proper mathematical notation and clear, precise language.""",
        
        "main_points": """Identify and explain:
- Step-by-step proof constructions
- Mathematical reasoning and logic
- Key theorems and their implications
- Important mathematical relationships
- Applications of mathematical concepts""",
        
        "examples": """Extract and format:
- Worked examples with detailed solutions
- Step-by-step problem-solving demonstrations
- Proof examples and techniques
- Applications of theorems
- Practice problems and solutions""",
        
        "summary": """Synthesize:
- Key mathematical principles covered
- Critical theorems and proofs
- Essential formulas and their applications
- Connections between concepts
- Problem-solving strategies"""
    }

    COMPUTER_SCIENCE = {
        "overview": """Create a comprehensive overview that:
- Identifies the core computing concepts
- Outlines algorithmic approaches and data structures
- Highlights programming paradigms or system architectures
- Explains computational complexity and efficiency
- Describes technical implementation details""",
        
        "key_concepts": """Extract and explain:
- Programming concepts and paradigms
- Data structures and algorithms
- System architecture principles
- Computational complexity analysis
- Technical specifications and requirements
Format with code examples and pseudocode where appropriate.""",
        
        "main_points": """Identify and explain:
- Algorithm design and analysis
- Implementation strategies
- System design principles
- Performance considerations
- Best practices and patterns""",
        
        "examples": """Extract and format:
- Code examples and implementations
- Algorithm demonstrations
- System design examples
- Performance optimization cases
- Debugging and testing scenarios""",
        
        "summary": """Synthesize:
- Key programming concepts
- Algorithm design principles
- System architecture decisions
- Implementation strategies
- Best practices and patterns"""
    }

    SCIENCES = {
        "overview": """Create a comprehensive overview that:
- Identifies the core scientific principles
- Outlines experimental methods and observations
- Highlights key theories and laws
- Explains natural phenomena
- Describes empirical evidence""",
        
        "key_concepts": """Extract and explain:
- Scientific laws and theories
- Physical/chemical principles
- Experimental methods
- Natural phenomena
- Quantitative relationships
Format using scientific notation and units where appropriate.""",
        
        "main_points": """Identify and explain:
- Scientific processes and mechanisms
- Experimental procedures
- Data analysis methods
- Theoretical frameworks
- Empirical observations""",
        
        "examples": """Extract and format:
- Laboratory experiments
- Real-world phenomena examples
- Data analysis demonstrations
- Scientific calculations
- Practical applications""",
        
        "summary": """Synthesize:
- Key scientific principles
- Experimental findings
- Theoretical implications
- Practical applications
- Future research directions"""
    }

    HUMANITIES = {
        "overview": """Create a comprehensive overview that:
- Identifies the main themes and ideas
- Places the content in historical or cultural context
- Outlines key philosophical or artistic concepts
- Highlights significant interpretations or perspectives""",
        
        "key_concepts": """Extract and explain:
- Important historical events and their significance
- Literary or artistic movements
- Philosophical theories and arguments
- Cultural contexts and influences
- Key figures and their contributions""",
        
        "main_points": """Identify and analyze:
- Critical interpretations and analyses
- Historical developments and trends
- Philosophical arguments and counter-arguments
- Cultural or artistic significance
- Thematic elements and motifs""",
        
        "examples": """Extract and format:
- Specific historical examples
- Literary or artistic works discussed
- Case studies of cultural phenomena
- Philosophical thought experiments
- Contextual illustrations""",
        
        "summary": """Synthesize:
- Main themes and arguments
- Historical or cultural significance
- Key interpretations and perspectives
- Broader implications
- Contemporary relevance"""
    }

    SOCIAL_SCIENCES = {
        "overview": """Create a comprehensive overview that:
- Outlines key social science theories or frameworks
- Identifies research methodologies discussed
- Highlights significant findings or trends
- Explains societal or behavioral implications""",
        
        "key_concepts": """Extract and explain:
- Theoretical frameworks and models
- Research methodologies
- Statistical concepts and findings
- Behavioral or social patterns
- Key terminology and definitions""",
        
        "main_points": """Identify and analyze:
- Research findings and implications
- Methodological approaches
- Data analysis and interpretations
- Societal or behavioral patterns
- Policy implications or applications""",
        
        "examples": """Extract and format:
- Research study examples
- Case studies of social phenomena
- Statistical data interpretations
- Real-world applications
- Policy implementation examples""",
        
        "summary": """Synthesize:
- Key research findings
- Theoretical implications
- Practical applications
- Policy recommendations
- Future research directions"""
    }

    BUSINESS = {
        "overview": """Create a comprehensive overview that:
- Outlines key business concepts or strategies
- Identifies market trends or economic factors
- Highlights management principles
- Explains practical business applications""",
        
        "key_concepts": """Extract and explain:
- Business models and frameworks
- Financial concepts and metrics
- Management strategies
- Market analysis tools
- Industry-specific terminology""",
        
        "main_points": """Identify and analyze:
- Strategic business decisions
- Financial analyses and implications
- Management best practices
- Market trends and opportunities
- Operational considerations""",
        
        "examples": """Extract and format:
- Business case studies
- Financial calculations
- Market analysis examples
- Management scenarios
- Industry applications""",
        
        "summary": """Synthesize:
- Key business principles
- Strategic recommendations
- Financial implications
- Management insights
- Market opportunities"""
    }

    HEALTH_SCIENCES = {
        "overview": """Create a comprehensive overview that:
- Outlines key medical or health concepts
- Identifies anatomical or physiological systems
- Highlights treatment approaches or protocols
- Explains clinical implications""",
        
        "key_concepts": """Extract and explain:
- Anatomical structures and functions
- Physiological processes
- Medical terminology
- Treatment protocols
- Clinical guidelines""",
        
        "main_points": """Identify and analyze:
- Diagnostic approaches
- Treatment methodologies
- Patient care considerations
- Clinical research findings
- Healthcare protocols""",
        
        "examples": """Extract and format:
- Clinical case studies
- Treatment examples
- Patient care scenarios
- Research study findings
- Medical procedures""",
        
        "summary": """Synthesize:
- Key medical concepts
- Clinical implications
- Treatment recommendations
- Patient care guidelines
- Research applications"""
    }

    @classmethod
    def get_prompts(cls, subject_category: str) -> Dict[str, str]:
        """Get the prompts for a specific subject category"""
        prompts = getattr(cls, subject_category, None)
        if not prompts:
            raise ValueError(f"Invalid subject category: {subject_category}")
        return prompts 